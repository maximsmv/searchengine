package searchengine.services.indexing;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
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
    private ActionSiteIndexing actionSiteIndexing;

    public IndexingSiteRun(Site site, SiteService siteService, PageService pageService) {
        this.site = site;
        this.siteService = siteService;
        this.pageService = pageService;
        actionSiteIndexing = new ActionSiteIndexing(site, siteService, pageService);
    }

    @Override
    public void run() {
        Document document = null;
        String lastError = null;
        try {
            document = Jsoup.connect(site.getUrl()).ignoreContentType(true).get();
            ForkJoinPool forkJoinPool = new ForkJoinPool();
            forkJoinPool.invoke(actionSiteIndexing);
            if (ActionSiteIndexing.isStopIndexing()) {
                stoppedIndexingByUser(forkJoinPool);
            } else {
                finishIndexing(forkJoinPool);
            }
        } catch (Exception e) {
            lastError = e.getMessage();
            e.printStackTrace();
        }
        if (document == null) {
            failedIndexing(lastError);
        }
    }

    private void finishIndexing(ForkJoinPool forkJoinPool) {
        System.out.println("Индексация сайта " + site.getName() + " ЗАВЕРШЕНА");
        site.setStatus(Status.INDEXED);
        siteService.update(site);
        forkJoinPool.shutdown();
    }

    private void failedIndexing(String lastError) {
        System.out.println("Не смог подключиться к сайту " + site.getName() + " ОШИБКА");
        site.setStatus(Status.FAILED);
        if (!lastError.isEmpty()) {
            site.setLastError(lastError);
        }
        siteService.update(site);
    }

    private void stoppedIndexingByUser(ForkJoinPool forkJoinPool) {
        System.out.println("Пользователь остановил индексацию " + site.getName() + " ОШИБКА");
        site.setStatus(Status.FAILED);
        site.setStatusTime(LocalDateTime.now());
        site.setLastError("Индексация остановлена пользователем");
        siteService.update(site);
        forkJoinPool.shutdown();
    }

    public void startOrStopIndexing(boolean isStopped) {
        ActionSiteIndexing.setStopIndexing(isStopped);
    }

}
