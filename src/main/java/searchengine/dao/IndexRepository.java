package searchengine.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import searchengine.model.Index;
import searchengine.model.Index_key;

public interface IndexRepository extends JpaRepository<Index, Index_key> {
}
