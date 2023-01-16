package searchengine.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import searchengine.config.SitesList;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.indexing.IndexingSiteRun;

import java.time.LocalDate;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;

@Service
@RequiredArgsConstructor
public class IndexServiceImpl implements IndexService {

    private SitesList sites;
    private SiteService siteService;
    private PageService pageService;
    private ExecutorService service;

    @Autowired
    public IndexServiceImpl(SitesList sites, SiteService siteService, PageService pageService) {
        this.sites = sites;
        this.siteService = siteService;
        this.pageService = pageService;
        service = Executors.newFixedThreadPool(sites.getSites().size());
    }

    @Override
    public void startIndexing() {
        for (int i = 0; i < sites.getSites().size(); i++) {
            Site site = new Site();
            site.setName(sites.getSites().get(i).getName());
            site.setUrl(sites.getSites().get(i).getUrl());
            site.setStatus(Status.INDEXING);
            site.setStatusTime(LocalDate.now());
            siteService.save(site);
            service.execute(new IndexingSiteRun(site, siteService, pageService));
        }
    }

    @Override
    public void stopIndexing() {

    }


}
