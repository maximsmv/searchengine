package searchengine.dto;

public class ResponseBody {
    boolean result;
    String error;

    public ResponseBody(boolean result) {
        this.result = result;
    }

    public ResponseBody(boolean result, String error) {
        this.result = result;
        this.error = error;
    }

    public boolean isResult() {
        return result;
    }

    public void setResult(boolean result) {
        this.result = result;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
