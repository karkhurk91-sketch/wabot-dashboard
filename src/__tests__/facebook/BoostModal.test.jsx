
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BoostModal from '../../components/facebook/BoostModal';
import { facebookApi } from '../../services/facebook/api';

jest.mock('../../services/facebook/api');

const mockPost = { id: '123', title: 'Test Post', content: 'Content', status: 'published' };

describe('BoostModal', () => {
  it('FP-18: opens modal and shows goal step', () => {
    render(<BoostModal post={mockPost} onClose={jest.fn()} onBoostCreated={jest.fn()} />);
    expect(screen.getByText('Choose Your Goal')).toBeInTheDocument();
  });

  it('FP-19: can proceed to audience step', () => {
    render(<BoostModal post={mockPost} onClose={jest.fn()} onBoostCreated={jest.fn()} />);
    fireEvent.click(screen.getByText('Next: Audience →'));
    expect(screen.getByText('Build Your Audience')).toBeInTheDocument();
  });

  it('FP-22: submits boost successfully', async () => {
    facebookApi.boostPost = jest.fn().mockResolvedValue({ data: { success: true } });
    const onBoostCreated = jest.fn();
    const onClose = jest.fn();
    render(<BoostModal post={mockPost} onClose={onClose} onBoostCreated={onBoostCreated} />);
    // Go to step 3
    fireEvent.click(screen.getByText('Next: Audience →'));
    fireEvent.click(screen.getByText('Next: Budget →'));
    // Submit
    fireEvent.click(screen.getByText('Boost Post'));
    await waitFor(() => {
      expect(facebookApi.boostPost).toHaveBeenCalled();
      expect(onBoostCreated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
