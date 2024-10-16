import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BookmarkContext = createContext();
const BASE_URL = "http://localhost:5000";

const initialState = {
  bookmarks: [],
  isLoading: false,
  currentBookmark: null,
  error: null,
};
function bookmarkReducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoading: true,
      };
    case "bookmarks/loaded":
      return {
        ...state,
        bookmarks: action.payload,
        isLoading: false,
      };
    case "bookmark/loaded":
      return {
        ...state,
        isLoading: false,
        currentBookmark: action.payload,
      };
    case "bookmark/created":
      return {
        ...state,
        isLoading: false,
        bookmarks: [...state.bookmarks, action.payload],
        currentBookmark: action.payload,
      };
    case "bookmark/deleted":
      return {
        ...state,
        isLoading: false,
        bookmarks: state.bookmarks.filter((item) => item.id !== action.payload),
        currentBookmark: null,
      };
    case "rejected":
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error("unKnown action");
  }
}
function BookmarkListProvider({ children }) {
  const [{ bookmarks, isLoading, currentBookmark }, dispatch] = useReducer(
    bookmarkReducer,
    initialState
  );
  useEffect(() => {
    async function fetchBookmarkList() {
      dispatch({ type: "loading" });
      try {
        const { data } = await axios.get(`${BASE_URL}/bookmarks`);
        dispatch({ type: "bookmarks/loaded", payload: data });
      } catch (error) {
        toast.error(error.message);
        dispatch({ type: "rejected", payload: error.message });
      }
    }
    fetchBookmarkList();
  }, []);

  async function getBookmark(id) {
    if (Number(id) === currentBookmark?.id) return;
    dispatch({ type: "loading" });
    try {
      const { data } = await axios.get(`${BASE_URL}/bookmarks/${id}`);
      dispatch({ type: "bookmark/loaded", payload: data });
    } catch (error) {
      toast.error(error.message);
      dispatch({
        type: "rejected",
        payload: "an Error occured in fetching single bookmark!",
      });
    }
  }
  async function deleteBookmark(id) {
    dispatch({ type: "loading" });
    try {
      const { data } = await axios.delete(`${BASE_URL}/bookmarks/${id}`);
      dispatch({ type: "bookmark/deleted", payload: id });

      // setBookmarks((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error.message);
      dispatch({
        type: "rejected",
        payload: "an Error occured in deleting single bookmark!",
      });
    }
  }

  async function createBookmark(newBookmark) {
    dispatch({ type: "loading" });
    try {
      const { data } = await axios.post(`${BASE_URL}/bookmarks`, newBookmark);
      dispatch({ type: "bookmark/created", payload: data });
    } catch (error) {
      toast.error(error.message);
      dispatch({
        type: "rejected",
        payload: "an Error occured in creating single bookmark!",
      });
    }
  }
  return (
    <BookmarkContext.Provider
      value={{
        isLoading,
        bookmarks,
        getBookmark,
        createBookmark,
        currentBookmark,
        deleteBookmark,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export default BookmarkListProvider;
export function useBookmark() {
  return useContext(BookmarkContext);
}
