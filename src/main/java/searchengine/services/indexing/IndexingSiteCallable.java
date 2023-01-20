package searchengine.services.indexing;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.PageService;
import searchengine.services.SiteService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.Future;

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
    public Boolean call() {
        Document document = null;
        String lastError;
        try {
            document = Jsoup.connect(site.getUrl()).ignoreContentType(true).get();
            ForkJoinPool forkJoinPool = new ForkJoinPool();
            forkJoinPool.invoke(new ActionSiteIndexing(site, siteService, pageService));
            site.setStatus(Status.INDEXED);
            siteService.update(site);
            return true;
        } catch (Exception e) {
            lastError = e.getMessage();
            e.printStackTrace();
        }
        site.setStatus(Status.FAILED);
        site.setLastError(lastError);
        siteService.update(site);
        return false;
    }
}
