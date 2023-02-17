package searchengine.services.indexing;

import lombok.RequiredArgsConstructor;
import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.jsoup.Connection.Response;

import org.springframework.stereotype.Service;
import searchengine.model.Page;
import searchengine.model.Site;
import searchengine.services.PageService;
import searchengine.services.SiteService;


import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.RecursiveAction;

@Service
@RequiredArgsConstructor
public class ActionSiteIndexing extends RecursiveAction {

    private static boolean stopIndexing = false;
    private static Set<String> urls;
    private SiteService siteService;
    private PageService pageService;
    private Site site;
    private Page page;
    private String lastError;
    private int statusCode = 0;

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
        if (!stopIndexing) {
            List<ActionSiteIndexing> taskList = new ArrayList<>();
            Document document = null;
            try {
                Response response = Jsoup.connect(site.getUrl() + page.getPath()).followRedirects(false).execute();
                if (response.statusCode() != 200) {
                    statusCode = response.statusCode();
                    throw new Exception("Ошибка подключения к странице " + response.statusMessage());
                }
                document = Jsoup.connect(site.getUrl() + page.getPath())
                        .userAgent("Mozilla/5.0 (Windows; U; WindowsNT 5.1; en-US; rv1.8.1.6) Gecko/20070725 Firefox/2.0.0.6")
                        .referrer("http://www.google.com")
                        .ignoreContentType(true)
                        .get();
                joinToPage(document);
            } catch (HttpStatusException e) {
                statusCode = e.getStatusCode();
                lastError = e.getMessage();
                e.printStackTrace();
            } catch (Exception e) {
                lastError = e.getMessage();
                e.printStackTrace();
            }
            if (document != null & !stopIndexing) {
                Elements linkParse = document.select("a");
                for (Element element : linkParse) {
                    String childUrl = element.attr("href");
                    if (isSuitableLink(site.getUrl(), childUrl) & !urls.contains(shortToFullUrl(site.getUrl(), childUrl)) & !stopIndexing) {
                        Page childPage = createNewPageAndAddToSet(childUrl);
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
            } else if (!stopIndexing) {
                updateErrorPage();
            }
        }
    }

    private void joinToPage(Document document) {
        System.out.println("Подключаюсь к странице: " + site.getUrl() + page.getPath());
        page.setCode(200);
        page.setContent(String.valueOf(document));
        pageService.save(page);
        site.setStatusTime(LocalDateTime.now());
        siteService.update(site);
    }

    private void updateErrorPage() {
        System.out.println("Не смог подключиться к странице: " + site.getUrl() + page.getPath());
        page.setCode(statusCode);
        page.setContent(lastError);
        site.setLastError(lastError);
        pageService.save(page);
        siteService.update(site);
    }

    private Page createNewPageAndAddToSet(String childUrl) {
        System.out.println("Зашел в форк новой сраницы: " + childUrl);
        Page childPage = new Page();
        childPage.setSite(site);
        childPage.setPath(fullToShortUrl(site.getUrl(), childUrl));
        urls.add(shortToFullUrl(site.getUrl(), childPage.getPath()));
        return childPage;
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

    public static boolean isStopIndexing() {
        return stopIndexing;
    }

    public static void setStopIndexing(boolean stopIndexing) {
        ActionSiteIndexing.stopIndexing = stopIndexing;
    }
}
