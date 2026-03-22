"use client"

import { useEffect, useState } from 'react';
import { deriveTopicsFromBlogs, fallbackBlogs as fallbackBlogEntries, shapeTopic } from './blogHelpers';
let cachedTopics = null;
let cachedFallback = false;

export const useBlogTopics = (blogs = [], initialTopics = null, initialIsFallback = false) => {
  const initialPrepared = Array.isArray(initialTopics) && initialTopics.length ? initialTopics.map(shapeTopic) : null;
  if (initialPrepared && !cachedTopics) {
    cachedTopics = initialPrepared;
    cachedFallback = initialIsFallback;
  }

  const [topics, setTopics] = useState(cachedTopics || initialPrepared || deriveTopicsFromBlogs(blogs) || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(cachedFallback || initialIsFallback || false);

  useEffect(() => {
    if (initialPrepared) {
      cachedTopics = initialPrepared;
      cachedFallback = initialIsFallback;
      setTopics(initialPrepared);
      setIsFallback(initialIsFallback);
    } else if (cachedTopics) {
      setTopics(cachedTopics);
      setIsFallback(cachedFallback);
    } else {
      const derived = deriveTopicsFromBlogs(blogs.length ? blogs : fallbackBlogEntries);
      cachedTopics = derived;
      cachedFallback = !blogs.length;
      setTopics(derived);
      setIsFallback(cachedFallback);
    }
    setIsLoading(false);
  }, [initialPrepared, initialIsFallback, blogs]);

  useEffect(() => {
    if (!cachedTopics && Array.isArray(blogs) && blogs.length) {
      setTopics(deriveTopicsFromBlogs(blogs));
      setIsFallback(false);
    }
  }, [blogs]);

  return { topics, isLoading, isFallback };
};

export const primeBlogTopicCache = (topics) => {
  if (!Array.isArray(topics)) return;
  cachedTopics = topics.map(shapeTopic);
  cachedFallback = false;
};

export const invalidateBlogTopicCache = () => {
  cachedTopics = null;
  cachedFallback = false;
};
