package searchengine.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import searchengine.dao.PageRepository;
import searchengine.model.Page;
import searchengine.model.Site;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {
    @Autowired
    private PageRepository pageRepository;

    @Override
    public void save(Page page) {
        pageRepository.save(page);
    }

    @Override
    public void saveAll(Set<Page> pages) {
        pageRepository.saveAll(pages);
    }

    @Override
    public void delete(int id) {
        pageRepository.deleteById(id);
    }

    @Override
    public void deleteAllBySite(Site site) {
        pageRepository.deleteAllBySite(site);
    }

    @Override
    public void deleteAll() {
        pageRepository.deleteAll();
    }

    @Override
    public Page findByPathAndSite(String path, Site site) {
        return pageRepository.findByPathAndSite(path, site);
    }

    @Override
    public List<Page> findAllBySite(Site site) {
        return pageRepository.findAllBySite(site);
    }

    @Override
    public List<Page> findAll() {
        return pageRepository.findAll();
    }
}
