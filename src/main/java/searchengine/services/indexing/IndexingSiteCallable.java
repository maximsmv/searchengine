package searchengine.services.indexing;

import searchengine.model.Site;
import searchengine.services.PageService;
import searchengine.services.SiteService;

import java.util.concurrent.Callable;
import java.util.concurrent.ForkJoinPool;

public class IndexingSiteCallable implements Callable<Boolean> {
    private Site site;
    private SiteService siteService;
    private PageService pageService;

    public IndexingSiteCallable(Site site, SiteService siteService, PageService pageService) {
        this.site = site;
        this.siteService = siteService;
        this.pageService = pageService;
    }


    @Override
    public Boolean call() throws Exception {
        ForkJoinPool forkJoinPool = new ForkJoinPool();
        forkJoinPool.invoke(new ActionSiteIndexing(site, siteService, pageService));
        return true;
    }
}
