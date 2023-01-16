package searchengine.services;

import searchengine.model.Page;
import searchengine.model.Site;

import java.util.List;
import java.util.Set;

public interface PageService {
    void save(Page page);
    void saveAll(Set<Page> pages);
    void delete(int id);
    void deleteAllBySite(Site site);
    void deleteAll();
    Page findByPathAndSite(String path, Site site);
    List<Page> findAllBySite(Site site);
    List<Page> findAll();
}
