package searchengine.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.StreamingHttpOutputMessage;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import searchengine.dto.ResponseBody;
import searchengine.dto.statistics.StatisticsResponse;
import searchengine.services.IndexService;
import searchengine.services.StatisticsService;

@RestController
@RequestMapping("/api")
public class ApiController {

    private final StatisticsService statisticsService;
    @Autowired
    private IndexService indexService;

    public ApiController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> statistics() {
        return ResponseEntity.ok(statisticsService.getStatistics());
    }

    @GetMapping("/startIndexing")
    public ResponseEntity<ResponseBody> indexing() {
        ResponseBody response;
        if (indexService.checkStartIndexing()) {
            response = new ResponseBody(false, "Индексация уже запущена");
            return ResponseEntity.status(405).body(response);
        }
        response = new ResponseBody(true);
        indexService.startIndexing();
        return ResponseEntity.status(200).body(response);
    }

    @GetMapping("/stopIndexing")
    public ResponseEntity<ResponseBody> stopIndexing() {
        ResponseBody response;
        if (indexService.checkStartIndexing()) {
            indexService.stopIndexing();
            response = new ResponseBody(true);
            return ResponseEntity.status(200).body(response);
        }
        response = new ResponseBody(false, "Индексация не запущена");
        return ResponseEntity.status(405).body(response);
    }
}
