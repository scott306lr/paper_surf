/**
 * Based on implementation on https://github.com/mimno/jsLDA and https://github.com/primaryobjects/lda
 */

import XRegExp from 'xregexp';
import { stemmer } from 'stemmer';


export const lda_abstract = (data: { paperId: string, abstract: string }[], precision: number, dict?: string[]) => {
    const dictionary = dict ?? []
    const sweeps = precision * 200; // precision 1~100
    const options = {
        displayingStopwords: false,
        language: 'en',
        numberTopics: 20,//100,
        sweeps: sweeps,
        stem: false,
    };

    const document = data.map(d => {
        return {
            id: d.paperId,
            text: d.abstract
        }
    });

    // const start_time = Date.now();
    const lda = new topicModelling(options, document, dictionary);
    // console.log("lda time:", Date.now() - start_time);

    return lda.getDocuments()
}



class topicModelling {
    /**
     * 
     * @param {object} settings 
     * @param {array} sentences 
     * @param {array} dict 
     */
    constructor(settings, sentences, dict) {
        this.settings = settings || {};
        if (dict) {
            this.dict = dict;
        }
        if (!isNaN(this.settings.numberTopics) && this.settings.numberTopics > 0) {
            this.numTopics = this.settings.numberTopics;
        } else {
            this.numTopics = 10;
        }

        this.documentTopicSmoothing = 0.1;  //alpha 
        this.topicWordSmoothing = 0.1;  //beta
        this.docSortSmoothing = 0.01;//10.0;
        this.sumDocSortSmoothing = this.docSortSmoothing * this.numTopics;

        this.completeSweeps = 0;
        this.requestedSweeps = 0;

        // vocabulary
        this.vocabularySize = 0;
        this.vocabularyCounts = {};

        if (this.settings.stem !== undefined) {
            this.stem = this.settings.stem;
        }

        if (this.settings.displayingStopWords !== undefined) {
            this.displayingStopwords = settings.displayingStopWords;
        }

        //documents
        this.documents = [];
        this.wordTopicCounts = {};
        this.topicWordCounts = [];
        this.topicScores = this.zeros(this.numTopics);
        this.tokensPerTopic = this.zeros(this.numTopics);
        this.topicWeights = this.zeros(this.numTopics);

        // this.stopwords = {};
        this.stopwords = stopwords;
        if (this.dict !== undefined) {
            this.dict.forEach(key => {
                this.stopwords[key] = true;
            });
        }

        this.prepareData(sentences);
        if (this.settings.sweeps !== undefined) {
            this.requestedSweeps = this.settings.sweeps;
        } else {
            this.requestedSweeps = 500;
        }
        while (this.completeSweeps <= this.requestedSweeps) {
            this.sweep();
        }
    }

    prepareData(documents) {
        if (!documents || documents.length < 0) {
            return;
        }
        let wordPattern = XRegExp('\\p{L}[\\p{L}\\p{P}]*\\p{L}', 'g');
        for (let item of documents) {
            if (item.text == '') {
                continue;
            }
            let sentence = Array.isArray(item.text)
                ? item.text
                : item.text.toLowerCase().match(wordPattern);
            let docID = item.id;
            let tokens = [];
            let topicCounts = this.zeros(this.numTopics);
            if (sentence == null) {
                continue;
            }
            sentence.forEach(word => {
                if (word !== '') {
                    let topic = Math.floor(Math.random() * this.numTopics);

                    if (word.length <= 2) {
                        this.stopwords[word] = 1;
                    }

                    let isStopword = this.stopwords[word];

                    if (this.stem && !isStopword) {
                        word = stemmer(word);
                        isStopword = this.stopwords[word];
                    }
                    if (isStopword) {
                        // Record counts for stopwords, but nothing else
                        if (!this.vocabularyCounts[word]) {
                            this.vocabularyCounts[word] = 1;
                        } else {
                            this.vocabularyCounts[word] += 1;
                        }
                    } else {
                        this.tokensPerTopic[topic]++;
                        if (!this.wordTopicCounts[word]) {
                            this.wordTopicCounts[word] = {};
                            this.vocabularySize++;
                            this.vocabularyCounts[word] = 0;
                        }
                        if (!this.wordTopicCounts[word][topic]) {
                            this.wordTopicCounts[word][topic] = 0;
                        }
                        this.wordTopicCounts[word][topic] += 1;
                        this.vocabularyCounts[word] += 1;
                        topicCounts[topic] += 1;
                    }
                    tokens.push({ word: word, topic: topic, isStopword: isStopword });
                }
            });
            this.documents.push({
                originalOrder: documents.length,
                id: docID,
                originalText: item.text,
                tokens: tokens,
                topicCounts: topicCounts
            });
        }
    }

    sweep() {
        let topicNormalizers = this.zeros(this.numTopics);
        for (let topic = 0; topic < this.numTopics; topic++) {
            topicNormalizers[topic] =
                1.0 /
                (this.vocabularySize * this.topicWordSmoothing +
                    this.tokensPerTopic[topic]);
        }

        for (let doc = 0; doc < this.documents.length; doc++) {
            let currentDoc = this.documents[doc];
            let docTopicCounts = currentDoc.topicCounts;

            for (let position = 0; position < currentDoc.tokens.length; position++) {
                let token = currentDoc.tokens[position];
                if (token.isStopword) {
                    continue;
                }

                this.tokensPerTopic[token.topic]--;
                let currentWordTopicCounts = this.wordTopicCounts[token.word];
                currentWordTopicCounts[token.topic]--;
                if (currentWordTopicCounts[token.topic] == 0) {
                    //delete(currentWordTopicCounts[ token.topic ]);
                }
                docTopicCounts[token.topic]--;
                topicNormalizers[token.topic] =
                    1.0 /
                    (this.vocabularySize * this.topicWordSmoothing +
                        this.tokensPerTopic[token.topic]);

                let sum = 0.0;
                for (let topic = 0; topic < this.numTopics; topic++) {
                    if (currentWordTopicCounts[topic]) {
                        this.topicWeights[topic] =
                            (this.documentTopicSmoothing + docTopicCounts[topic]) *
                            (this.topicWordSmoothing + currentWordTopicCounts[topic]) *
                            topicNormalizers[topic];
                    } else {
                        this.topicWeights[topic] =
                            (this.documentTopicSmoothing + docTopicCounts[topic]) *
                            this.topicWordSmoothing *
                            topicNormalizers[topic];
                    }
                    sum += this.topicWeights[topic];
                }

                // Sample from an unnormalized discrete distribution
                let sample = sum * Math.random();
                let i = 0;
                sample -= this.topicWeights[i];
                while (sample > 0.0) {
                    i++;
                    sample -= this.topicWeights[i];
                }
                token.topic = i;

                this.tokensPerTopic[token.topic]++;
                if (!currentWordTopicCounts[token.topic]) {
                    currentWordTopicCounts[token.topic] = 1;
                } else {
                    currentWordTopicCounts[token.topic] += 1;
                }
                docTopicCounts[token.topic]++;

                topicNormalizers[token.topic] =
                    1.0 /
                    (this.vocabularySize * this.topicWordSmoothing +
                        this.tokensPerTopic[token.topic]);
            }
        }

        //console.log("sweep in " + (Date.now() - startTime) + " ms");
        this.completeSweeps += 1;
        if (this.completeSweeps >= this.requestedSweeps) {
            this.sortTopicWords();
        }
    }

    byCountDescending(a, b) {
        return b.count - a.count;
    }

    topNWords(wordCounts, n) {
        return wordCounts
            .slice(0, n)
            .map(d => {
                return d.word;
            })
            .join(' ');
    }

    sortTopicWords() {
        this.topicWordCounts = [];
        for (let topic = 0; topic < this.numTopics; topic++) {
            this.topicWordCounts[topic] = [];
        }

        for (let word in this.wordTopicCounts) {
            for (let topic in this.wordTopicCounts[word]) {
                this.topicWordCounts[topic].push({
                    word: word,
                    count: this.wordTopicCounts[word][topic]
                });
            }
        }

        for (let topic = 0; topic < this.numTopics; topic++) {
            this.topicWordCounts[topic].sort(this.byCountDescending);
        }
    }

    getTopicWords(numWords) {
        let topicTopWords = [];
        for (let topic = 0; topic < this.numTopics; topic++) {
            topicTopWords.push(this.topNWords(this.topicWordCounts[topic], numWords));
        }
        this.calcDominantTopic();

        let topicData = topicTopWords.map((words, index) => {
            return { id: index, topicText: words, score: this.topicScores[index] };
        });
        return topicData;
    }

    calcDominantTopic() {
        this.documents.map((doc, i) => {
            let topic = -1;
            let score = -1;
            for (
                let selectedTopic = 0;
                selectedTopic < this.numTopics;
                selectedTopic++
            ) {
                let tempScore =
                    (doc.topicCounts[selectedTopic] + this.docSortSmoothing) /
                    (doc.tokens.length + this.sumDocSortSmoothing);
                if (tempScore >= score) {
                    score = tempScore;
                    topic = selectedTopic;
                }
            }
            this.topicScores[topic] += 1;
        });
        this.topicScores = this.topicScores.map(val => val / this.documents.length);
    }

    getDocuments() {
        let sentences = [];

        for (
            let selectedTopic = 0;
            selectedTopic < this.numTopics;
            selectedTopic++
        ) {
            let documentVocab = this.getVocab(selectedTopic, true);
            let scores = this.documents.map((doc, i) => {
                return {
                    docID: i,
                    score:
                        (doc.topicCounts[selectedTopic] + this.docSortSmoothing) /
                        (doc.tokens.length + this.sumDocSortSmoothing)
                };
            });
            scores.sort((a, b) => {
                return b.score - a.score;
            });
            let docinfo = [];
            for (let val of scores) {
                if (this.documents[val.docID].topicCounts[selectedTopic] > 0) {
                    docinfo.push({
                        id: this.documents[val.docID].id,
                        text: this.documents[val.docID].originalText,
                        score: val.score
                    });
                }
            }
            sentences.push({
                topic: selectedTopic,
                documents: docinfo,
                documentVocab
            });
        }
        return sentences;
    }
    //
    // Vocabulary
    //

    mostFrequentWords(includeStops, sortByTopic, selectedTopic) {
        // Convert the random-access map to a list of word:count pairs that
        //  we can then sort.
        let wordCounts = [];

        if (sortByTopic) {
            for (let word in this.vocabularyCounts) {
                if (
                    this.wordTopicCounts[word] &&
                    this.wordTopicCounts[word][selectedTopic]
                ) {
                    wordCounts.push({
                        word: word,
                        count: this.wordTopicCounts[word][selectedTopic]
                    });
                }
            }
        } else {
            for (let word in this.vocabularyCounts) {
                if (includeStops || !this.stopwords[word]) {
                    wordCounts.push({ word: word, count: this.vocabularyCounts[word] });
                }
            }
        }

        wordCounts.sort(this.byCountDescending);
        return wordCounts;
    }

    entropy(counts) {
        counts = counts.filter(function (x) {
            return x > 0.0;
        });
        let sum = this.sum(counts);
        return (
            Math.log(sum) - (1.0 / sum) * this.sum(counts.map(x => x * Math.log(x)))
        );
    }

    specificity(word) {
        if (this.wordTopicCounts[word] == undefined) {
            return 0;
        }
        return (
            1.0 -
            this.entropy(Object.values(this.wordTopicCounts[word])) /
            Math.log(this.numTopics)
        );
    }

    getVocab(selectedTopic, sortVocabByTopic) {
        let vocab = [];
        let wordFrequencies = this.mostFrequentWords(
            this.displayingStopwords,
            sortVocabByTopic,
            selectedTopic
        ).slice(0, 499);
        wordFrequencies.forEach(d => {
            let isStopword = this.stopwords[d.word];
            let score = this.specificity(d.word);
            vocab.push({
                word: d.word,
                count: d.count,
                stopword: isStopword,
                specificity: score
            });
        });
        return vocab;
    }

    truncate(s) {
        return s.length > 300 ? s.substring(0, 299) + '...' : s;
    }

    zeros(n) {
        var x = new Array(n);
        for (var i = 0; i < n; i++) {
            x[i] = 0.0;
        }
        return x;
    }

    sum(arr) {
        return arr.reduce((sum, currentValue) => {
            return sum + currentValue;
        });
    }
}

const stopwords = {
    "a": 1,
    "about": 1,
    "above": 1,
    "after": 1,
    "again": 1,
    "against": 1,
    "ain": 1,
    "all": 1,
    "am": 1,
    "an": 1,
    "and": 1,
    "any": 1,
    "are": 1,
    "aren": 1,
    "aren't": 1,
    "as": 1,
    "at": 1,
    "be": 1,
    "because": 1,
    "been": 1,
    "before": 1,
    "being": 1,
    "below": 1,
    "between": 1,
    "both": 1,
    "but": 1,
    "by": 1,
    "can": 1,
    "couldn": 1,
    "couldn't": 1,
    "d": 1,
    "did": 1,
    "didn": 1,
    "didn't": 1,
    "do": 1,
    "does": 1,
    "doesn": 1,
    "doesn't": 1,
    "doing": 1,
    "don": 1,
    "don't": 1,
    "down": 1,
    "during": 1,
    "each": 1,
    "few": 1,
    "for": 1,
    "from": 1,
    "further": 1,
    "had": 1,
    "hadn": 1,
    "hadn't": 1,
    "has": 1,
    "hasn": 1,
    "hasn't": 1,
    "have": 1,
    "haven": 1,
    "haven't": 1,
    "having": 1,
    "he": 1,
    "her": 1,
    "here": 1,
    "hers": 1,
    "herself": 1,
    "him": 1,
    "himself": 1,
    "his": 1,
    "how": 1,
    "i": 1,
    "if": 1,
    "in": 1,
    "into": 1,
    "is": 1,
    "isn": 1,
    "isn't": 1,
    "it": 1,
    "it's": 1,
    "its": 1,
    "itself": 1,
    "just": 1,
    "ll": 1,
    "m": 1,
    "ma": 1,
    "me": 1,
    "mightn": 1,
    "mightn't": 1,
    "more": 1,
    "most": 1,
    "mustn": 1,
    "mustn't": 1,
    "my": 1,
    "myself": 1,
    "needn": 1,
    "needn't": 1,
    "no": 1,
    "nor": 1,
    "not": 1,
    "now": 1,
    "o": 1,
    "of": 1,
    "off": 1,
    "on": 1,
    "once": 1,
    "only": 1,
    "or": 1,
    "other": 1,
    "our": 1,
    "ours": 1,
    "ourselves": 1,
    "out": 1,
    "over": 1,
    "own": 1,
    "re": 1,
    "s": 1,
    "same": 1,
    "shan": 1,
    "shan't": 1,
    "she": 1,
    "she's": 1,
    "should": 1,
    "should've": 1,
    "shouldn": 1,
    "shouldn't": 1,
    "so": 1,
    "some": 1,
    "such": 1,
    "t": 1,
    "than": 1,
    "that": 1,
    "that'll": 1,
    "the": 1,
    "their": 1,
    "theirs": 1,
    "them": 1,
    "themselves": 1,
    "then": 1,
    "there": 1,
    "these": 1,
    "they": 1,
    "this": 1,
    "those": 1,
    "through": 1,
    "to": 1,
    "too": 1,
    "under": 1,
    "until": 1,
    "up": 1,
    "ve": 1,
    "very": 1,
    "was": 1,
    "wasn": 1,
    "wasn't": 1,
    "we": 1,
    "were": 1,
    "weren": 1,
    "weren't": 1,
    "what": 1,
    "when": 1,
    "where": 1,
    "which": 1,
    "while": 1,
    "who": 1,
    "whom": 1,
    "why": 1,
    "will": 1,
    "with": 1,
    "won": 1,
    "won't": 1,
    "wouldn": 1,
    "wouldn't": 1,
    "y": 1,
    "you": 1,
    "you'd": 1,
    "you'll": 1,
    "you're": 1,
    "you've": 1,
    "your": 1,
    "yours": 1,
    "yourself": 1,
    "yourselves": 1,
    "could": 1,
    "he'd": 1,
    "he'll": 1,
    "he's": 1,
    "here's": 1,
    "how's": 1,
    "i'd": 1,
    "i'll": 1,
    "i'm": 1,
    "i've": 1,
    "let's": 1,
    "ought": 1,
    "she'd": 1,
    "she'll": 1,
    "that's": 1,
    "there's": 1,
    "they'd": 1,
    "they'll": 1,
    "they're": 1,
    "they've": 1,
    "we'd": 1,
    "we'll": 1,
    "we're": 1,
    "we've": 1,
    "what's": 1,
    "when's": 1,
    "where's": 1,
    "who's": 1,
    "why's": 1,
    "would": 1,
    "able": 1,
    "abst": 1,
    "accordance": 1,
    "according": 1,
    "accordingly": 1,
    "across": 1,
    "act": 1,
    "actually": 1,
    "added": 1,
    "adj": 1,
    "affected": 1,
    "affecting": 1,
    "affects": 1,
    "afterwards": 1,
    "ah": 1,
    "almost": 1,
    "alone": 1,
    "along": 1,
    "already": 1,
    "also": 1,
    "although": 1,
    "always": 1,
    "among": 1,
    "amongst": 1,
    "announce": 1,
    "another": 1,
    "anybody": 1,
    "anyhow": 1,
    "anymore": 1,
    "anyone": 1,
    "anything": 1,
    "anyway": 1,
    "anyways": 1,
    "anywhere": 1,
    "apparently": 1,
    "approximately": 1,
    "arent": 1,
    "arise": 1,
    "around": 1,
    "aside": 1,
    "ask": 1,
    "asking": 1,
    "auth": 1,
    "available": 1,
    "away": 1,
    "awfully": 1,
    "b": 1,
    "back": 1,
    "became": 1,
    "become": 1,
    "becomes": 1,
    "becoming": 1,
    "beforehand": 1,
    "begin": 1,
    "beginning": 1,
    "beginnings": 1,
    "begins": 1,
    "behind": 1,
    "believe": 1,
    "beside": 1,
    "besides": 1,
    "beyond": 1,
    "biol": 1,
    "brief": 1,
    "briefly": 1,
    "c": 1,
    "ca": 1,
    "came": 1,
    "cannot": 1,
    "can't": 1,
    "cause": 1,
    "causes": 1,
    "certain": 1,
    "certainly": 1,
    "co": 1,
    "com": 1,
    "come": 1,
    "comes": 1,
    "contain": 1,
    "containing": 1,
    "contains": 1,
    "couldnt": 1,
    "date": 1,
    "different": 1,
    "done": 1,
    "downwards": 1,
    "due": 1,
    "e": 1,
    "ed": 1,
    "edu": 1,
    "effect": 1,
    "eg": 1,
    "eight": 1,
    "eighty": 1,
    "either": 1,
    "else": 1,
    "elsewhere": 1,
    "end": 1,
    "ending": 1,
    "enough": 1,
    "especially": 1,
    "et": 1,
    "etc": 1,
    "even": 1,
    "ever": 1,
    "every": 1,
    "everybody": 1,
    "everyone": 1,
    "everything": 1,
    "everywhere": 1,
    "ex": 1,
    "except": 1,
    "f": 1,
    "far": 1,
    "ff": 1,
    "fifth": 1,
    "first": 1,
    "five": 1,
    "fix": 1,
    "followed": 1,
    "following": 1,
    "follows": 1,
    "former": 1,
    "formerly": 1,
    "forth": 1,
    "found": 1,
    "four": 1,
    "furthermore": 1,
    "g": 1,
    "gave": 1,
    "get": 1,
    "gets": 1,
    "getting": 1,
    "give": 1,
    "given": 1,
    "gives": 1,
    "giving": 1,
    "go": 1,
    "goes": 1,
    "gone": 1,
    "got": 1,
    "gotten": 1,
    "h": 1,
    "happens": 1,
    "hardly": 1,
    "hed": 1,
    "hence": 1,
    "hereafter": 1,
    "hereby": 1,
    "herein": 1,
    "heres": 1,
    "hereupon": 1,
    "hes": 1,
    "hi": 1,
    "hid": 1,
    "hither": 1,
    "home": 1,
    "howbeit": 1,
    "however": 1,
    "hundred": 1,
    "id": 1,
    "ie": 1,
    "im": 1,
    "immediate": 1,
    "immediately": 1,
    "importance": 1,
    "important": 1,
    "inc": 1,
    "indeed": 1,
    "index": 1,
    "information": 1,
    "instead": 1,
    "invention": 1,
    "inward": 1,
    "itd": 1,
    "it'll": 1,
    "j": 1,
    "k": 1,
    "keep": 1,
    "keeps": 1,
    "kept": 1,
    "kg": 1,
    "km": 1,
    "know": 1,
    "known": 1,
    "knows": 1,
    "l": 1,
    "largely": 1,
    "last": 1,
    "lately": 1,
    "later": 1,
    "latter": 1,
    "latterly": 1,
    "least": 1,
    "less": 1,
    "lest": 1,
    "let": 1,
    "lets": 1,
    "like": 1,
    "liked": 1,
    "likely": 1,
    "line": 1,
    "little": 1,
    "'ll": 1,
    "look": 1,
    "looking": 1,
    "looks": 1,
    "ltd": 1,
    "made": 1,
    "mainly": 1,
    "make": 1,
    "makes": 1,
    "many": 1,
    "may": 1,
    "maybe": 1,
    "mean": 1,
    "means": 1,
    "meantime": 1,
    "meanwhile": 1,
    "merely": 1,
    "mg": 1,
    "might": 1,
    "million": 1,
    "miss": 1,
    "ml": 1,
    "moreover": 1,
    "mostly": 1,
    "mr": 1,
    "mrs": 1,
    "much": 1,
    "mug": 1,
    "must": 1,
    "n": 1,
    "na": 1,
    "name": 1,
    "namely": 1,
    "nay": 1,
    "nd": 1,
    "near": 1,
    "nearly": 1,
    "necessarily": 1,
    "necessary": 1,
    "need": 1,
    "needs": 1,
    "neither": 1,
    "never": 1,
    "nevertheless": 1,
    "new": 1,
    "next": 1,
    "nine": 1,
    "ninety": 1,
    "nobody": 1,
    "non": 1,
    "none": 1,
    "nonetheless": 1,
    "noone": 1,
    "normally": 1,
    "nos": 1,
    "noted": 1,
    "nothing": 1,
    "nowhere": 1,
    "obtain": 1,
    "obtained": 1,
    "obviously": 1,
    "often": 1,
    "oh": 1,
    "ok": 1,
    "okay": 1,
    "old": 1,
    "omitted": 1,
    "one": 1,
    "ones": 1,
    "onto": 1,
    "ord": 1,
    "others": 1,
    "otherwise": 1,
    "outside": 1,
    "overall": 1,
    "owing": 1,
    "p": 1,
    "page": 1,
    "pages": 1,
    "part": 1,
    "particular": 1,
    "particularly": 1,
    "past": 1,
    "per": 1,
    "perhaps": 1,
    "placed": 1,
    "please": 1,
    "plus": 1,
    "poorly": 1,
    "possible": 1,
    "possibly": 1,
    "potentially": 1,
    "pp": 1,
    "predominantly": 1,
    "present": 1,
    "previously": 1,
    "primarily": 1,
    "probably": 1,
    "promptly": 1,
    "proud": 1,
    "provides": 1,
    "put": 1,
    "q": 1,
    "que": 1,
    "quickly": 1,
    "quite": 1,
    "qv": 1,
    "r": 1,
    "ran": 1,
    "rather": 1,
    "rd": 1,
    "readily": 1,
    "really": 1,
    "recent": 1,
    "recently": 1,
    "ref": 1,
    "refs": 1,
    "regarding": 1,
    "regardless": 1,
    "regards": 1,
    "related": 1,
    "relatively": 1,
    "research": 1,
    "respectively": 1,
    "resulted": 1,
    "resulting": 1,
    "results": 1,
    "right": 1,
    "run": 1,
    "said": 1,
    "saw": 1,
    "say": 1,
    "saying": 1,
    "says": 1,
    "sec": 1,
    "section": 1,
    "see": 1,
    "seeing": 1,
    "seem": 1,
    "seemed": 1,
    "seeming": 1,
    "seems": 1,
    "seen": 1,
    "self": 1,
    "selves": 1,
    "sent": 1,
    "seven": 1,
    "several": 1,
    "shall": 1,
    "shed": 1,
    "shes": 1,
    "show": 1,
    "showed": 1,
    "shown": 1,
    "showns": 1,
    "shows": 1,
    "significant": 1,
    "significantly": 1,
    "similar": 1,
    "similarly": 1,
    "since": 1,
    "six": 1,
    "slightly": 1,
    "somebody": 1,
    "somehow": 1,
    "someone": 1,
    "somethan": 1,
    "something": 1,
    "sometime": 1,
    "sometimes": 1,
    "somewhat": 1,
    "somewhere": 1,
    "soon": 1,
    "sorry": 1,
    "specifically": 1,
    "specified": 1,
    "specify": 1,
    "specifying": 1,
    "still": 1,
    "stop": 1,
    "strongly": 1,
    "sub": 1,
    "substantially": 1,
    "successfully": 1,
    "sufficiently": 1,
    "suggest": 1,
    "sup": 1,
    "sure": 1,
    "take": 1,
    "taken": 1,
    "taking": 1,
    "tell": 1,
    "tends": 1,
    "th": 1,
    "thank": 1,
    "thanks": 1,
    "thanx": 1,
    "thats": 1,
    "that've": 1,
    "thence": 1,
    "thereafter": 1,
    "thereby": 1,
    "thered": 1,
    "therefore": 1,
    "therein": 1,
    "there'll": 1,
    "thereof": 1,
    "therere": 1,
    "theres": 1,
    "thereto": 1,
    "thereupon": 1,
    "there've": 1,
    "theyd": 1,
    "theyre": 1,
    "think": 1,
    "thou": 1,
    "though": 1,
    "thoughh": 1,
    "thousand": 1,
    "throug": 1,
    "throughout": 1,
    "thru": 1,
    "thus": 1,
    "til": 1,
    "tip": 1,
    "together": 1,
    "took": 1,
    "toward": 1,
    "towards": 1,
    "tried": 1,
    "tries": 1,
    "truly": 1,
    "try": 1,
    "trying": 1,
    "ts": 1,
    "twice": 1,
    "two": 1,
    "u": 1,
    "un": 1,
    "unfortunately": 1,
    "unless": 1,
    "unlike": 1,
    "unlikely": 1,
    "unto": 1,
    "upon": 1,
    "ups": 1,
    "us": 1,
    "use": 1,
    "used": 1,
    "useful": 1,
    "usefully": 1,
    "usefulness": 1,
    "uses": 1,
    "using": 1,
    "usually": 1,
    "v": 1,
    "value": 1,
    "various": 1,
    "'ve": 1,
    "via": 1,
    "viz": 1,
    "vol": 1,
    "vols": 1,
    "vs": 1,
    "w": 1,
    "want": 1,
    "wants": 1,
    "wasnt": 1,
    "way": 1,
    "wed": 1,
    "welcome": 1,
    "went": 1,
    "werent": 1,
    "whatever": 1,
    "what'll": 1,
    "whats": 1,
    "whence": 1,
    "whenever": 1,
    "whereafter": 1,
    "whereas": 1,
    "whereby": 1,
    "wherein": 1,
    "wheres": 1,
    "whereupon": 1,
    "wherever": 1,
    "whether": 1,
    "whim": 1,
    "whither": 1,
    "whod": 1,
    "whoever": 1,
    "whole": 1,
    "who'll": 1,
    "whomever": 1,
    "whos": 1,
    "whose": 1,
    "widely": 1,
    "willing": 1,
    "wish": 1,
    "within": 1,
    "without": 1,
    "wont": 1,
    "words": 1,
    "world": 1,
    "wouldnt": 1,
    "www": 1,
    "x": 1,
    "yes": 1,
    "yet": 1,
    "youd": 1,
    "youre": 1,
    "z": 1,
    "zero": 1,
    "a's": 1,
    "ain't": 1,
    "allow": 1,
    "allows": 1,
    "apart": 1,
    "appear": 1,
    "appreciate": 1,
    "appropriate": 1,
    "associated": 1,
    "best": 1,
    "better": 1,
    "c'mon": 1,
    "c's": 1,
    "cant": 1,
    "changes": 1,
    "clearly": 1,
    "concerning": 1,
    "consequently": 1,
    "consider": 1,
    "considering": 1,
    "corresponding": 1,
    "course": 1,
    "currently": 1,
    "definitely": 1,
    "described": 1,
    "despite": 1,
    "entirely": 1,
    "exactly": 1,
    "example": 1,
    "going": 1,
    "greetings": 1,
    "hello": 1,
    "help": 1,
    "hopefully": 1,
    "ignored": 1,
    "inasmuch": 1,
    "indicate": 1,
    "indicated": 1,
    "indicates": 1,
    "inner": 1,
    "insofar": 1,
    "it'd": 1,
    "novel": 1,
    "presumably": 1,
    "reasonably": 1,
    "second": 1,
    "secondly": 1,
    "sensible": 1,
    "serious": 1,
    "seriously": 1,
    "t's": 1,
    "third": 1,
    "thorough": 1,
    "thoroughly": 1,
    "three": 1,
    "well": 1,
    "wonder": 1,
    //additional stopwords
    "based": 1,
    "including": 1,
    "paper": 1,
    "named": 1,
    "state-of-the-art": 1,
    "employs": 1,
    "employ": 1,
    // "tasks": 1,
    "overcome": 1,
    "overcomes": 1,
    "method": 1,
    "methods": 1,
    "work": 1,
    "works": 1,
    "propose": 1,
    "proposes": 1,
    "proposed": 1,
    "presents": 1,
    "represent": 1,
    "consists": 1,
    "researcher": 1,
    "researchers": 1,
    "achieve": 1,
    "achieves": 1,
    "perform": 1,
    "performance": 1,
    "introduce": 1,
    "introduced": 1,
    "introduces": 1,
    "introducing": 1,
    "approach": 1,
    "approaches": 1,
    "approached": 1,
    "approaching": 1,
    "process": 1,
    "leverages": 1,
    "leverage": 1,
    "leverageing": 1,
    "leveraged": 1,
    "study": 1,
    "studies": 1,
    "technique": 1,
    "techniques": 1,
}