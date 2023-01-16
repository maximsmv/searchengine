package searchengine.model;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "site")
public class Site {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Enumerated(value = EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    @Column(columnDefinition = "timestamp NOT NULL", name = "status_time")
    private LocalDate statusTime;
    @Column(columnDefinition = "TEXT", name = "last_error")
    private String lastError;
    @Column(columnDefinition = "VARCHAR(255) NOT NULL")
    private String url;
    @Column(columnDefinition = "VARCHAR(255) NOT NULL")
    private String name;

    public Site() {
    }

    public Site(Status status, LocalDate statusTime, String lastError, String url, String name) {
        this.status = status;
        this.statusTime = statusTime;
        this.lastError = lastError;
        this.url = url;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getStatusTime() {
        return statusTime;
    }

    public void setStatusTime(LocalDate statusTime) {
        this.statusTime = statusTime;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
