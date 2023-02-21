package searchengine.services.util;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import searchengine.model.Page;
import searchengine.model.Site;
import searchengine.services.PageService;
import searchengine.services.SiteService;

import java.time.LocalDateTime;

import static searchengine.services.util.UrlsRedactor.fullToShortUrl;

@Slf4j
public class PageWorker {
    public static void joinToPage(Document document, Page page, Site site, PageService pageService, SiteService siteService) {
        log.info("Подключаюсь к странице: " + site.getUrl() + page.getPath());
        page.setCode(200);
        page.setContent(String.valueOf(document));
        pageService.save(page);
        site.setStatusTime(LocalDateTime.now());
        siteService.update(site);
    }

    public static void updateErrorPage(Page page, Site site, int statusCode, String lastError, PageService pageService, SiteService siteService) {
        log.error("Не смог подключиться к странице: " + site.getUrl() + page.getPath());
        page.setCode(statusCode);
        page.setContent(lastError);
        site.setLastError(lastError);
        pageService.save(page);
        siteService.update(site);
    }

    public static Page createNewPage(String childUrl, Site site) {
        log.info("Зашел в форк новой сраницы: " + childUrl);
        Page childPage = new Page();
        childPage.setSite(site);
        childPage.setPath(fullToShortUrl(site.getUrl(), childUrl));
        return childPage;
    }
}
