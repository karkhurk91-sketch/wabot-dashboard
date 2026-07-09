
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FacebookPostList from '../../pages/facebook/PostList';
import { facebookApi } from '../../services/facebook/api';

jest.mock('../../services/facebook/api');

const mockPosts = [
  { id: '1', title: 'Post 1', content: 'Content', status: 'published' },
  { id: '2', title: 'Post 2', content: 'Draft', status: 'draft' },
];

describe('FacebookPostList', () => {
  it('FP-24: renders posts', async () => {
    facebookApi.listPosts = jest.fn().mockResolvedValue({ data: mockPosts });
    render(<FacebookPostList />);
    await waitFor(() => {
      expect(screen.getByText('Post 1')).toBeInTheDocument();
      expect(screen.getByText('Post 2')).toBeInTheDocument();
    });
  });

  it('FP-25: filters by status', async () => {
    facebookApi.listPosts = jest.fn().mockResolvedValue({ data: [mockPosts[1]] });
    render(<FacebookPostList />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'draft' } });
    await waitFor(() => {
      expect(screen.getByText('Post 2')).toBeInTheDocument();
      expect(screen.queryByText('Post 1')).toBeNull();
    });
  });
});
