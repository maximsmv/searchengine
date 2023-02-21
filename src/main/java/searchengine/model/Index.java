package searchengine.model;

import javax.persistence.*;
import java.io.Serializable;
import java.util.logging.Level;

@Entity
@IdClass(Index_key.class)
@Table(name = "index")
public class Index implements Serializable{
    @Id
    @ManyToOne
    @JoinColumn(name = "page_id")
    private Page page;
    @Id
    @ManyToOne
    @JoinColumn(name = "lemma_id")
    private Lemma lemma;
    @Column(columnDefinition = "real NOT NULL")
    private float rank;
}
