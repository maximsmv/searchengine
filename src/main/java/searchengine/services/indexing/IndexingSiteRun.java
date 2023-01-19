package searchengine.services.indexing;

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
        ForkJoinPool forkJoinPool = new ForkJoinPool();
        forkJoinPool.invoke(new ActionSiteIndexing(site, siteService, pageService));
        forkJoinPool.shutdownNow();
        if (forkJoinPool.isShutdown()) {
            Site site1 = siteService.findByUrl(site.getUrl());
            site1.setStatus(Status.INDEXED);
            site1.setStatusTime(LocalDateTime.now());
            siteService.update(site1);
        }
    }
}
