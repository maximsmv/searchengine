package searchengine.services.indexing;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.PageService;
import searchengine.services.SiteService;

import java.io.IOException;
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
    public Boolean call() {
        Document document = null;
        try {
            document = Jsoup.connect(site.getUrl()).ignoreContentType(true).get();
//            ForkJoinPool forkJoinPool = new ForkJoinPool();
//            forkJoinPool.invoke(new ActionSiteIndexing(site, siteService, pageService));
            new ForkJoinPool().invoke(new ActionSiteIndexing(site, siteService, pageService));
            System.out.println("\n\n" + Thread.currentThread().getId() + " завершение потока с сайтом \n\n" + site.getName());
            return true;
        } catch (IOException e) {
            e.printStackTrace();
        }
        site.setStatus(Status.FAILED);
        siteService.update(site);
        return false;
    }
}
