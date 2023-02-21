package searchengine.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import searchengine.config.SitesList;
import searchengine.model.Page;
import searchengine.model.Site;
import searchengine.model.Status;
import searchengine.services.indexing.ActionSiteIndexing;
import searchengine.services.indexing.IndexingSiteRun;
import searchengine.services.util.UrlsRedactor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndexServiceImpl implements IndexService {

    private SitesList sites;
    private SiteService siteService;
    private PageService pageService;

    @Autowired
    public IndexServiceImpl(SitesList sites, SiteService siteService, PageService pageService) {
        this.sites = sites;
        this.siteService = siteService;
        this.pageService = pageService;
    }

    @Override
    public void startIndexing() {
        log.info("Запускаю индексацию...");
        ActionSiteIndexing.setStopIndexing(false);
        for (int i = 0; i < sites.getSites().size(); i++) {
          Site site = siteService.findByName(sites.getSites().get(i).getName());
          if (site != null) {
              siteService.delete(site);
          }
        }
        ExecutorService service = Executors.newFixedThreadPool(sites.getSites().size());
        List<Site> siteModelList = mapSite(sites);
        for (int i = 0; i < sites.getSites().size(); i++) {
            IndexingSiteRun task = new IndexingSiteRun(siteModelList.get(i), siteService, pageService);
            service.execute(task);
        }
    }

    @Override
    public void stopIndexing() {
        ActionSiteIndexing.setStopIndexing(true);
    }

    @Override
    public void indexPage(String url) {
        ActionSiteIndexing.setStopIndexing(false);
        log.info("Запускаю индексацию одной страницы...");
        Site site = siteService.findByContainsUrl(url);
        Page page = pageService.findByPathAndSite(UrlsRedactor.fullToShortUrl(site.getUrl(), url), site);
        if (page != null) {
            log.info("Такая страница уже существует, удаляю существующую...");
            pageService.delete(page.getId());
        }
        ActionSiteIndexing task = new ActionSiteIndexing(url, site, siteService, pageService);
        task.indexPage();
        log.info("Запустил индексацию " + url);
    }

    @Override
    public boolean checkIndexedPage(String url) {
        List<String> siteUrlList = siteService.findAll().stream()
                .map(Site::getUrl)
                .toList();
        for (String s : siteUrlList) {
            if (url.contains(s)) {
                return true;
            }
        }
        return false;
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
