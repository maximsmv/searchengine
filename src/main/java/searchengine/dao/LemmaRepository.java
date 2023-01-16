package searchengine.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import searchengine.model.Lemma;

public interface LemmaRepository extends JpaRepository<Lemma, Integer> {
}
