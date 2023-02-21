package searchengine.services.indexing;

import lombok.RequiredArgsConstructor;
import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.jsoup.Connection.Response;

import org.springframework.stereotype.Service;
import searchengine.dao.SiteRepository;
import searchengine.model.Page;
import searchengine.model.Site;
import searchengine.services.PageService;
import searchengine.services.SiteService;


import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.RecursiveAction;

import static searchengine.services.util.PageWorker.*;
import static searchengine.services.util.UrlsRedactor.*;

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

    public ActionSiteIndexing(String url, Site site, SiteService siteService, PageService pageService) {
        this.site = site;
        Page page = new Page();
        page.setPath(fullToShortUrl(site.getUrl(), url));
        page.setSite(site);
        this.page = page;
        this.siteService = siteService;
        this.pageService = pageService;
    }

    @Override
    protected void compute() {
        if (!stopIndexing) {
            List<ActionSiteIndexing> taskList = new ArrayList<>();
            Document document = indexPage();
            if (document != null & !stopIndexing) {
                Elements linkParse = document.select("a");
                for (Element element : linkParse) {
                    String childUrl = element.attr("href");
                    if (isSuitableLink(site.getUrl(), childUrl) & !urls.contains(shortToFullUrl(site.getUrl(), childUrl)) & !stopIndexing) {
                        Page childPage = createNewPage(childUrl, site);
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
            } else if (!stopIndexing) {
                updateErrorPage(page, site, statusCode, lastError, pageService, siteService);
            }
        }
    }

    public Document indexPage() {
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
            joinToPage(document, page, site, pageService, siteService);
        } catch (HttpStatusException e) {
            statusCode = e.getStatusCode();
            lastError = e.getMessage();
            e.printStackTrace();
        } catch (Exception e) {
            lastError = e.getMessage();
            e.printStackTrace();
        }
        return document;
    }

    public static boolean isStopIndexing() {
        return stopIndexing;
    }

    public static void setStopIndexing(boolean stopIndexing) {
        ActionSiteIndexing.stopIndexing = stopIndexing;
    }
}
