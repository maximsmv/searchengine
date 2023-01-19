package searchengine.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import searchengine.config.SitesList;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.indexing.IndexingSiteCallable;
import searchengine.services.indexing.IndexingSiteRun;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
public class IndexServiceImpl implements IndexService {

    private SitesList sites;
    private SiteService siteService;
    private PageService pageService;
    private ExecutorService service;
    List<Future<Boolean>> futures;

    @Autowired
    public IndexServiceImpl(SitesList sites, SiteService siteService, PageService pageService) {
        this.sites = sites;
        this.siteService = siteService;
        this.pageService = pageService;
        service = Executors.newFixedThreadPool(sites.getSites().size());
        futures = new ArrayList<>();
    }

    @Override
    public void startIndexing() {
        List<Site> siteModelList = mapSite(sites);
        List<IndexingSiteCallable> tasks = new ArrayList<>();
        for (int i = 0; i < sites.getSites().size(); i++) {
            IndexingSiteCallable task = new IndexingSiteCallable(siteModelList.get(i), siteService, pageService);
            tasks.add(task);
//            Future<Boolean> submit = service.submit(new IndexingSiteCallable(siteModelList.get(i), siteService, pageService));
//            futures.add(submit);
        }
//        try {
//            futures = service.invokeAll(tasks);
//        } catch (InterruptedException e) {
//            e.printStackTrace();
//        }
        try {
            service.invokeAll(tasks);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("FINISH");

    }

    private List<Site> mapSite(SitesList sites) {
        List<Site> siteModelList = new ArrayList<>();
        for (int i = 0; i < sites.getSites().size(); i++) {
            Site site = new Site();
            site.setName(sites.getSites().get(i).getName());
            site.setUrl(sites.getSites().get(i).getUrl());
            site.setStatus(Status.INDEXING);
            site.setStatusTime(LocalDateTime.now());
            siteService.save(site);
            siteModelList.add(site);
        }
        return siteModelList;
    }
}
