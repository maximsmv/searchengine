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

    @Autowired
    public IndexServiceImpl(SitesList sites, SiteService siteService, PageService pageService) {
        this.sites = sites;
        this.siteService = siteService;
        this.pageService = pageService;
        service = Executors.newFixedThreadPool(sites.getSites().size());
    }

    @Override
    public void startIndexing() {
        List<Site> siteModelList = mapSite(sites);
        for (int i = 0; i < sites.getSites().size(); i++) {
            IndexingSiteRun task = new IndexingSiteRun(siteModelList.get(i), siteService, pageService);
            service.execute(task);
        }
    }

    @Override
    public boolean checkStartIndexing() {
        List<Site> siteModelList = siteService.findAll();
        for (Site site : siteModelList) {
            if (site.getStatus() == Status.INDEXING) {
                return true;
            }
        }
        return false;
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
