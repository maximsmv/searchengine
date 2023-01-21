package searchengine.services.indexing;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.PageService;
import searchengine.services.SiteService;

import java.time.LocalDateTime;
import java.util.concurrent.ForkJoinPool;

public class IndexingSiteRun implements Runnable {

    private Site site;
    private SiteService siteService;
    private PageService pageService;

    public IndexingSiteRun(Site site, SiteService siteService, PageService pageService) {
        this.site = site;
        this.siteService = siteService;
        this.pageService = pageService;
    }

    @Override
    public void run() {
        Document document = null;
        String lastError = null;
        try {
            document = Jsoup.connect(site.getUrl()).ignoreContentType(true).get();
            ForkJoinPool forkJoinPool = new ForkJoinPool();
            forkJoinPool.invoke(new ActionSiteIndexing(site, siteService, pageService));
            System.out.println("Индексация сайта " + site.getName() + " ЗАВЕРШЕНА");
            site.setStatus(Status.INDEXED);
            siteService.update(site);
            forkJoinPool.shutdown();
        } catch (Exception e) {
            lastError = e.getMessage();
            e.printStackTrace();
        }
        if (document == null) {
            site.setStatus(Status.FAILED);
            if (!lastError.isEmpty()) {
                site.setLastError(lastError);
            }
            siteService.update(site);
        }

    }
}
