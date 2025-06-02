
console.log('Starting MoodQuiz tests...');

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { MoodQuiz } from '../MoodQuiz';
import '@testing-library/jest-dom';

// Mock the timer functions
jest.useFakeTimers();

describe('MoodQuiz', () => {
  console.log('Setting up MoodQuiz test suite...');
  
  afterEach(() => {
    console.log('Cleaning up after test...');
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    console.log('Cleaning up test suite...');
    jest.useRealTimers();
  });

  it('renders mood options', () => {
    const onComplete = jest.fn();
    const onDismiss = jest.fn();
    
    render(<MoodQuiz onComplete={onComplete} onDismiss={onDismiss} />);
    
    expect(screen.getByText('How are you feeling today?')).toBeInTheDocument();
    expect(screen.getByText('Calm and relaxed')).toBeInTheDocument();
    expect(screen.getByText('A bit stressed')).toBeInTheDocument();
    expect(screen.getByText('Neutral')).toBeInTheDocument();
    expect(screen.getByText('Anxious')).toBeInTheDocument();
    expect(screen.getByText('Tired')).toBeInTheDocument();
  });

  it('calls onComplete when a mood is selected', async () => {
    const user = userEvent.setup({ delay: null });
    const onComplete = jest.fn();
    const onDismiss = jest.fn();
    
    render(<MoodQuiz onComplete={onComplete} onDismiss={onDismiss} />);
    
    await user.click(screen.getByText('Calm and relaxed'));
    
    // Fast-forward time
    jest.advanceTimersByTime(600);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onDismiss when the close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onComplete = jest.fn();
    const onDismiss = jest.fn();
    
    render(<MoodQuiz onComplete={onComplete} onDismiss={onDismiss} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
