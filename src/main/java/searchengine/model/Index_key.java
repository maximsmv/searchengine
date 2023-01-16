package searchengine.model;

import java.io.Serializable;
import javax.persistence.*;

@Embeddable
public class Index_key implements Serializable {
    @ManyToOne
    @JoinColumn(name = "page_id")
    protected Page page;
    @ManyToOne
    @JoinColumn(name = "lemma_id")
    protected Lemma lemma;
}
