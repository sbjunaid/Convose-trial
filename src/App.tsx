import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const App = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mostPopular, setMostPopular] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const fetchResults = async (text) => {
    try {
      const response = await fetch(
        `https://be-v2.convose.com/autocomplete/interests?q=${text}&limit=12&from=0`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Jy8RZCXvvc6pZQUu2QZ2',
          },
        }
      );
      const data = await response.json();

      if (!data.autocomplete || data.autocomplete.length === 0) {
        setResults([]);
        setMostPopular(null);
        return;
      }

      //To determine the most popular item (highest match value)
      const mostPopularItem = data.autocomplete.reduce((prev, curr) =>
        prev.match > curr.match ? prev : curr, data.autocomplete[0]
      );

      setMostPopular(mostPopularItem);

      //To filter and sort results alphabetically (excluding the most popular)
      const filteredResults = data.autocomplete
        .filter(item => item.id !== mostPopularItem.id)
        .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

      //To ensure bottom-to-top rendering with most popular at the bottom
      setResults([...filteredResults, mostPopularItem]);

    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
    fetchResults(text);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.resultItem, item.id === mostPopular?.id && styles.popularItem]}>
      <View style={styles.textContainer}>
        <Text style={styles.primaryText}>{item.name}</Text>
        {item.name.includes("[") && (
          <Text style={styles.secondaryText}>{item.name.match(/\[(.*)\]/)?.[1]}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.listContainer}>
        <FlatList
          data={results.slice().reverse()} // To Render from bottom to top
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
        />
      </View>
      <View
        style={[
          styles.searchBarContainer,
          keyboardOpen && { bottom: height * 0.1 },
        ]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={query}
          onChangeText={handleSearch}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.04,
  },
  listContainer: {
    flex: 1,
    marginBottom: height * 0.08, // Ensure list appears above search bar
  },
  searchBarContainer: {
    position: 'absolute',
    bottom: height * 0.02,
    left: width * 0.15, 
    width: width * 0.7,
    backgroundColor: '#f8f8f8',
    borderRadius: width * 0.06,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchInput: {
    height: height * 0.06,
    paddingHorizontal: width * 0.04,
    fontSize: width * 0.045,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  popularItem: {
    backgroundColor: '#e6f7ff', //To highlight for most popular item
  },
  textContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  primaryText: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  secondaryText: {
    fontSize: width * 0.04,
    color: '#888',
    marginLeft: width * 0.02,
  },
});

export default App;
