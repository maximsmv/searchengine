package searchengine.services.lemma;

import org.apache.lucene.morphology.LuceneMorphology;
import org.apache.lucene.morphology.russian.RussianLuceneMorphology;

import java.io.IOException;
import java.util.*;

public class LemmasFinder {
    private final LuceneMorphology luceneMorphology;
    private static final String WORD_TYPE_REGEX = "\\W\\w&&[^а-яА-Я\\s]";
    private static final String[] particlesNames = new String[]{"МЕЖД", "ПРЕДЛ", "СОЮЗ"};

    private LemmasFinder(LuceneMorphology luceneMorphology) {
        this.luceneMorphology = luceneMorphology;
    }

    private LemmasFinder(){
        throw new RuntimeException("Disallow construct");
    }

    /**
     * Метод разделяет текст на слова, находит все леммы и считает их количество.
     *
     * @param text текст из которого будут выбираться леммы
     * @return ключ является леммой, а значение количеством найденных лемм
     */
    public Map<String, Integer> collectLemmas(String text) {
        String[] words = arrayContainsRussianWords(text);
        HashMap<String, Integer> lemmas = new HashMap<>();

        for (String word : words) {
            if (word.isBlank()) {
                continue;
            }

            List<String> wordBaseForms = luceneMorphology.getMorphInfo(word);
            if (anyWordBaseBelongToParticle(wordBaseForms)) {
                continue;
            }

            List<String> normalForms = luceneMorphology.getNormalForms(word);
            if (normalForms.isEmpty()) {
                continue;
            }

            String normalWord = normalForms.get(0);

            if (lemmas.containsKey(normalWord)) {
                lemmas.put(normalWord, lemmas.get(normalWord) + 1);
            } else {
                lemmas.put(normalWord, 1);
            }
        }

        return lemmas;
    }
//    /**
//     * @param text текст из которого собираем все леммы
//     * @return набор уникальных лемм найденных в тексте
//     */
//    public Set<String> getLemmaSet(String text) {
//        String[] textArray = arrayContainsRussianWords(text);
//        Set<String> lemmaSet = new HashSet<>();
//        for (String word : textArray) {
//            if (!word.isEmpty() && isCorrectWordForm(word)) {
//                List<String> wordBaseForms = luceneMorphology.getMorphInfo(word);
//                if (anyWordBaseBelongToParticle(wordBaseForms)) {
//                    continue;
//                }
//                lemmaSet.addAll(luceneMorphology.getNormalForms(word));
//            }
//        }
//        return lemmaSet;
//    }

    public String cleanFromHtmlCode(String text) {
        String regex = "<.+>";
        return text.replaceAll(regex, "");
    }

    private boolean anyWordBaseBelongToParticle(List<String> wordBaseForms) {
        return wordBaseForms.stream().anyMatch(this::hasParticleProperty);
    }

    private boolean hasParticleProperty(String wordBase) {
        for (String property : particlesNames) {
            if (wordBase.toUpperCase().contains(property)) {
                return true;
            }
        }
        return false;
    }

    private String[] arrayContainsRussianWords(String text) {
        return text.toLowerCase(Locale.ROOT)
                .replaceAll("([^а-я\\s])", " ")
                .trim()
                .split("\\s+");
    }

//    private boolean isCorrectWordForm(String word) {
//        List<String> wordInfo = luceneMorphology.getMorphInfo(word);
//        for (String morphInfo : wordInfo) {
//            if (morphInfo.matches(WORD_TYPE_REGEX)) {
//                return false;
//            }
//        }
//        return true;
//    }
}
