package searchengine.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import searchengine.config.SitesList;
import searchengine.dao.PageRepository;
import searchengine.dao.SiteRepository;
import searchengine.model.Site;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SiteServiceImpl implements SiteService {
    @Autowired
    private SiteRepository siteRepository;

    @Override
    public void save(Site site) {
        siteRepository.save(site);
    }

    @Override
    public void update(Site site) {
        siteRepository.save(site);
    }

    @Override
    public List<Site> findAll() {
        return siteRepository.findAll();
    }

    @Override
    public Site findByUrl(String url) {
        return siteRepository.findByUrl(url);
    }

    @Override
    public void delete(Site site) {
        siteRepository.delete(site);
    }

    @Override
    public void deleteByUrl(String url) {
        Site site = findByUrl(url);
        if (site != null) {
            siteRepository.delete(site);
        }
    }

    @Override
    public void deleteAll() {
        siteRepository.deleteAll();
    }


}
