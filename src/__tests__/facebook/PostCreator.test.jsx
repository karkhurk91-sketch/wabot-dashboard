
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FacebookPostCreator from '../../pages/facebook/PostCreator';
import { facebookApi } from '../../services/facebook/api';

jest.mock('../../services/facebook/api');
jest.mock('../../hooks/useFacebookPages', () => ({
  useFacebookPages: () => ({ pages: [{ id: '1', name: 'Test Page' }], loading: false })
}));

describe('FacebookPostCreator', () => {
  it('FP-01: renders the component', () => {
    render(<FacebookPostCreator />);
    expect(screen.getByText('Create Post')).toBeInTheDocument();
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('FP-02: selects a page from dropdown', () => {
    render(<FacebookPostCreator />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    expect(select.value).toBe('1');
  });

  it('FP-06: shows validation error when publishing without content', async () => {
    render(<FacebookPostCreator />);
    const publishBtn = screen.getByText('Publish');
    fireEvent.click(publishBtn);
    await waitFor(() => {
      expect(screen.getByText('Post content is required')).toBeInTheDocument();
    });
  });

  it('FP-05: saves as draft', async () => {
    facebookApi.createPost = jest.fn().mockResolvedValue({ data: { db_id: '123', message: 'Post saved as draft' } });
    render(<FacebookPostCreator />);
    const content = screen.getByPlaceholderText("What's on your mind?");
    await userEvent.type(content, 'Draft content');
    const draftBtn = screen.getByText('Finish later');
    fireEvent.click(draftBtn);
    await waitFor(() => {
      expect(facebookApi.createPost).toHaveBeenCalledWith(expect.objectContaining({ publish_now: false }));
      expect(screen.getByText('Post saved as draft!')).toBeInTheDocument();
    });
  });

  it('FP-08: toggles ad post', () => {
    render(<FacebookPostCreator />);
    const toggle = screen.getByLabelText('Make this an ad post');
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });
});
