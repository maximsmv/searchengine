package searchengine.services.util;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class UrlsRedactor {
    public static boolean isSuitableLink(String mainUrl, String childUrl) {
        String regexFullUrl = mainUrl + "/.+/.*";
        String regexShortUrl = "/.+/.*";
        return (childUrl.matches(regexFullUrl) || childUrl.matches(regexShortUrl))
                & !childUrl.contains(".PNG") & !childUrl.contains(".jpg")
                & !childUrl.contains(".JPG") & !childUrl.contains("#")
                & !childUrl.contains(".png") & !childUrl.contains(".jpeg")
                & !childUrl.contains(".doc") & !childUrl.contains(".docx")
                & !childUrl.contains(".pdf") & !childUrl.contains("utm_source")
                & !childUrl.contains(".mp4") & !childUrl.contains("?")
                & !childUrl.contains(".zip");
    }

    public static String shortToFullUrl(String mainUrl, String childUrl) {
        String regexFullUrl = mainUrl + "/.+/.*";
        if (childUrl.matches(regexFullUrl)) {
            return childUrl;
        } else {
            return mainUrl + childUrl;
        }
    }

    public static String fullToShortUrl(String mainUrl, String childUrl) {
        String shortUrl = childUrl.replace(mainUrl, "");
        if (shortUrl.isEmpty()) {
            return "/";
        } else {
            return shortUrl;
        }
    }

    public static String getMainUrlFromFull(String url) {
        String regex = "^http[s]?://\\w+.\\w+";
        if (url.matches(regex)) {
            return url;
        }
        String[] urlSplit = url.split(regex);
        String result = null;
        try {
            result = url.replaceAll(urlSplit[1], "");
        } catch (ArrayIndexOutOfBoundsException e) {
            log.error("Неверно передана ссылка");
        }
        return result;
    }
}
