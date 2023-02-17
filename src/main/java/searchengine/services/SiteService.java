package searchengine.services;

import searchengine.model.Site;

import java.util.List;

public interface SiteService {
    void save(Site site);
    void update(Site site);
    List<Site> findAll();
    Site findByUrl(String url);
    Site findByName(String name);
    void delete(Site site);
    void deleteByUrl(String url);
    void deleteAll();
}
