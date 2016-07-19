import { Component } from 'react';
import unexpected from 'unexpected';

import Truncate from '../src/Truncate';

const expect = unexpected.clone();

describe('<Truncate />', () => {
    it('should be a React component', () => {
        expect(Truncate, 'to be a', Component.constructor);
    });
});
