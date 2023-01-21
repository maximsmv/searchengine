package searchengine.services.indexing;

import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import org.springframework.stereotype.Service;
import searchengine.model.Page;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.PageService;
import searchengine.services.SiteService;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ForkJoinTask;
import java.util.concurrent.RecursiveAction;

@Service
@RequiredArgsConstructor
public class ActionSiteIndexing extends RecursiveAction {

    private static Set<String> urls;
    private SiteService siteService;
    private PageService pageService;
    private Site site;
    private Page page;
    private String lastError;

    public ActionSiteIndexing(Site site, SiteService siteService, PageService pageService) {
        this.site = site;
        Page page = new Page();
        page.setPath("/");
        page.setSite(site);
        urls = new HashSet<>();
        urls.add(site.getUrl() + "/");
        this.page = page;
        this.siteService = siteService;
        this.pageService = pageService;
    }

    public ActionSiteIndexing(Site site, Page page, SiteService siteService, PageService pageService) {
        this.site = site;
        this.page = page;
        this.siteService = siteService;
        this.pageService = pageService;
    }

    @Override
    protected void compute() {
        List<ActionSiteIndexing> taskList = new ArrayList<>();
        Document document = null;
        try {
            document = Jsoup.connect(site.getUrl() + page.getPath()).ignoreContentType(true).get();
            System.out.println("Подключаюсь к странице: " + site.getUrl() + page.getPath());
            page.setCode(200);
            page.setContent(String.valueOf(document));
            //TODO: Сделать проверку на наличие текста в document
            pageService.save(page);
            site.setStatusTime(LocalDateTime.now());
            siteService.update(site);
        } catch (Exception e) {
            lastError = e.getMessage();
            e.printStackTrace();
        }
        if (document != null) {
            Elements linkParse = document.select("a");
            for (Element element : linkParse) {
                String childUrl = element.attr("href");
                if (isSuitableLink(site.getUrl(), childUrl) & !urls.contains(shortToFullUrl(site.getUrl(), childUrl))) {
                    System.out.println("Зашел в форк новой сраницы: " + childUrl);
                    Page childPage = new Page();
                    childPage.setSite(site);
                    childPage.setPath(fullToShortUrl(site.getUrl(), childUrl));
                    urls.add(shortToFullUrl(site.getUrl(), childPage.getPath()));
                    ActionSiteIndexing task = new ActionSiteIndexing(site, childPage, siteService, pageService);
                    task.fork();
                    taskList.add(task);
                }
            }
            if (!taskList.isEmpty()) {
                for (ActionSiteIndexing task : taskList) {
                    task.join();
                }
            }
        } else {
            System.out.println("Не смог подключиться к странице: " + site.getUrl() + page.getPath());
            page.setCode(404);
            page.setContent(lastError);
            site.setLastError(lastError);
            pageService.save(page);
            siteService.update(site);
        }
    }

    private boolean isSuitableLink(String mainUrl, String childUrl) {
        String regexFullUrl = mainUrl + "/.+/.*";
        String regexShortUrl = "/.+/.*";
        return (childUrl.matches(regexFullUrl) || childUrl.matches(regexShortUrl))
                & !childUrl.contains(".PNG") & !childUrl.contains(".jpg")
                & !childUrl.contains(".JPG") & !childUrl.contains("#")
                & !childUrl.contains(".png") & !childUrl.contains(".jpeg")
                & !childUrl.contains(".doc") & !childUrl.contains(".docx")
                & !childUrl.contains(".pdf") & !childUrl.contains("utm_source")
                & !childUrl.contains(".mp4") & !childUrl.contains("?")
                & !childUrl.contains(".zip");
    }

    private String shortToFullUrl(String mainUrl, String childUrl) {
        String regexFullUrl = mainUrl + "/.+/.*";
        if (childUrl.matches(regexFullUrl)) {
            return childUrl;
        } else {
            return mainUrl + childUrl;
        }
    }

    private String fullToShortUrl(String mainUrl, String childUrl) {
        String shortUrl = childUrl.replace(mainUrl, "");
        if (shortUrl.isEmpty()) {
            return "/";
        } else {
            return shortUrl;
        }
    }
}
