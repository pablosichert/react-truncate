import React, { Component } from 'react';
import { createRenderer, renderIntoDocument } from 'react-addons-test-utils';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import sinon from 'sinon';
import { jsdom } from 'jsdom';
import requestAnimationFrame from 'raf';
import Canvas from 'canvas';

import Truncate from '../src/Truncate';

const expect = unexpected.clone()
    .use(unexpectedReact)
;

global.document = jsdom();
global.window = global.document.defaultView;
global.window.Canvas = Canvas;
global.window.requestAnimationFrame = requestAnimationFrame;

for (let key in global.window) {
    if (!global[key]) {
        global[key] = global.window[key];
    }
}

describe('<Truncate />', () => {
    it('should be a React component', () => {
        expect(Truncate, 'to be a', Component.constructor);
    });

    it('should render a span', () => {
        let renderer = createRenderer();
        renderer.render(<Truncate />);

        expect(renderer, 'to have rendered', <span />);
    });

    it('should truncate text', () => {
        let br = global.window.HTMLBRElement;

        sinon.stub(global.window.HTMLDivElement.prototype,
            'getBoundingClientRect', () => ({ width: 85 })
        );

        let component = renderIntoDocument(
            <div>
                <Truncate lines={2} ellipsis='…'>
                    This text should
                    stop after here
                    and not contain the
                    next lines
                </Truncate>
            </div>
        );

        let children = component.children[0].children;

        expect(children[0].textContent, 'to be', 'This text should');
        expect(children[1], 'to be a', br);
        expect(children[2].textContent, 'to be', 'stop after here …');

        global.window.HTMLDivElement.prototype.getBoundingClientRect.restore();
    });
});
