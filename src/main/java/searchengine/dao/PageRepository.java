package searchengine.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import searchengine.model.Page;
import searchengine.model.Site;

import java.util.List;

public interface PageRepository extends JpaRepository<Page, Integer> {
    void deleteAllBySite(Site site);
    List<Page> findAllBySite(Site site);
    Page findByPathAndSite(String path, Site site);
}
