import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchFromJsonPlaceholder, isValidUser, type BlogPost, type User } from './api';

describe('fetchFromJsonPlaceHolder', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    /**
     * This test asserts that fetchFromJsonPlaceholder correctly parses the JSON response
     * and returns the respective typed object.
     * 
     * fetchFromJsonPlaceholder simulates slow network with a timer, the test
     * uses fake timers to get around that. The underlying fetch call is stubbed
     * to return a mock json object to be parsed.
     */
    it('returns parsed JSON for a successful response', async () => {
        vi.useFakeTimers();

        const users: User[] = [
            {
                id: 1,
                name: 'Ada Lovelace',
                email: 'ada@example.com',
                phone: '123-456-7890'
            }
        ];

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => users
            })
        );

        const result = fetchFromJsonPlaceholder<User[]>('users');
        const assertion = expect(result).resolves.toEqual(users);

        await vi.advanceTimersByTimeAsync(2000);

        await assertion;
        expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
    });

    it('throws a descriptive error when the response is not ok', async () => {
        vi.useFakeTimers();

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Not Found'
            })
        );

        const result = fetchFromJsonPlaceholder<User>('users/999');
        const assertion = expect(result).rejects.toThrow(
            'Failed to fetch data from users/999: Not Found'
        );

        await vi.advanceTimersByTimeAsync(2000);

        await assertion;
    });
});

describe('isValidUser', () => {
    it('accepts objects with the required user shape', () => {
        const user: User = {
            id: 1,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            phone: '123-456-7890'
        };

        expect(isValidUser(user)).toBe(true);
    });

    it('rejects a blog post cast to a user', () => {
        const post: BlogPost = {
            id: 2,
            userId: 1,
            title: 'Typed APIs',
            body: 'Do not trust casts for runtime validation.'
        };

        const maybeUser = post as unknown;

        expect(isValidUser(maybeUser)).toBe(false);
    });
});