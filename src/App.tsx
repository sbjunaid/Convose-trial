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
      const sortedResults = data.autocomplete.sort((a, b) => {
        if (query === '') {
          return b.match - a.match; // Sort by popularity if no query
        }
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
      setResults(sortedResults.reverse()); // Invert order for bottom-to-top scrolling
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
    fetchResults(text);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
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
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        inverted
        keyboardShouldPersistTaps="handled"
      />
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
    flexGrow: 1,
    justifyContent: 'flex-end',
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
