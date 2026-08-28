import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogVisitModal from './LogVisitModal';

describe('LogVisitModal', () => {
  it('keeps Save disabled until a rating is chosen, then submits the rating', async () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <LogVisitModal placeName="Da'an Park" onClose={vi.fn()} onSubmit={onSubmit} />,
    );

    const save = screen.getByRole('button', { name: /save/i });
    expect(save).toBeDisabled();

    // StarRating renders each star as <span role="button"> (no text label),
    // so query the stars directly rather than by accessible name.
    const stars = container.querySelectorAll('span[role="button"]');
    expect(stars).toHaveLength(5);

    await userEvent.click(stars[4]); // 5th star → rating 5
    expect(save).toBeEnabled();

    await userEvent.click(save);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ rating: 5 }),
    );
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(
      <LogVisitModal placeName="Da'an Park" onClose={onClose} onSubmit={vi.fn()} />,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});