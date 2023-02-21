package searchengine.services;

public interface IndexService {
    void startIndexing();
    void stopIndexing();
    void indexPage(String url);
    boolean checkStartIndexing();
    boolean checkIndexedPage(String url);
}
