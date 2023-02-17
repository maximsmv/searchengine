package searchengine.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import searchengine.config.SitesList;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.indexing.IndexingSiteRun;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IndexServiceImpl implements IndexService {

    private SitesList sites;
    private SiteService siteService;
    private PageService pageService;
    private ExecutorService service;
    private List<IndexingSiteRun> tasks;

    @Autowired
    public IndexServiceImpl(SitesList sites, SiteService siteService, PageService pageService) {
        this.sites = sites;
        this.siteService = siteService;
        this.pageService = pageService;
        service = Executors.newFixedThreadPool(sites.getSites().size());
        tasks = new ArrayList<>();
    }

    @Override
    public void startIndexing() {
        for (int i = 0; i < sites.getSites().size(); i++) {
          Site site = siteService.findByName(sites.getSites().get(i).getName());
          if (site != null) {
              siteService.delete(site);
          }
        }
        List<Site> siteModelList = mapSite(sites);
        for (int i = 0; i < sites.getSites().size(); i++) {
            IndexingSiteRun task = new IndexingSiteRun(siteModelList.get(i), siteService, pageService);
            tasks.add(task);
            service.execute(task);
        }
    }

    @Override
    public void stopIndexing() {
        for (IndexingSiteRun task : tasks) {
            task.stopIndexing(true);
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
