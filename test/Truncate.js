import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import unexpectedSinon from 'unexpected-sinon';
import unexpectedDOM from 'unexpected-dom';
import sinon from 'sinon';
import { jsdom } from 'jsdom';
import requestAnimationFrame from 'raf';
import Canvas from 'canvas';
import React, { Component } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { createRenderer, renderIntoDocument } from 'react-addons-test-utils';
import { stripIndent } from 'common-tags';

import Truncate from '../src/Truncate';

global.document = jsdom();
global.window = global.document.defaultView;
global.window.Canvas = Canvas;
global.window.requestAnimationFrame = requestAnimationFrame;

for (let key in global.window) {
    if (!global[key]) {
        global[key] = global.window[key];
    }
}

const expect = unexpected.clone()
    .use(unexpectedReact)
    .use(unexpectedSinon)
    .use(unexpectedDOM)
    .addAssertion('<DOMElement> to display text <string>', (expect, subject, value) => {
        function nodeToText(node) {
            return Array.prototype.reduce.call(node.children, (prev, curr) => {
                if (curr instanceof global.window.HTMLBRElement) {
                    return prev += '\n';
                }

                return prev += curr.textContent;
            }, '');
        }

        return expect(nodeToText(subject), 'to equal', stripIndent`${value}`);
    })
;

describe('<Truncate />', () => {
    it('should be a React component', () => {
        expect(Truncate, 'to be a', Component.constructor);
    });

    it('should render a span', () => {
        let renderer = createRenderer();
        renderer.render(<Truncate />);

        expect(renderer, 'to have rendered', <span />);
    });

    describe('with a box of 85px mocked out', () => {
        before(() => {
            sinon.stub(global.window.HTMLDivElement.prototype,
                'getBoundingClientRect', () => ({ width: 85 })
            );
        });

        after(() => {
            global.window.HTMLDivElement.prototype.getBoundingClientRect.restore();
        });

        it('should truncate text', () => {
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

            expect(component.children[0], 'to display text', `
                This text should
                stop after here…
            `);
        });

        it("should not add empty lines when text doesn't fill all lines", () => {
            let component = renderIntoDocument(
                <div>
                    <Truncate lines={4}>
                        Some short text
                        over here
                    </Truncate>
                </div>
            );

            expect(component.children[0], 'to display text', `
                Some short text
                over here
            `);
        });

        it('should not truncate at all if specified in lines prop', () => {
            let Wrapper = class extends Component {
                render() {
                    return (
                        <div>
                            <Truncate lines={false}>
                                Preserve this text
                                as it was!
                            </Truncate>
                        </div>
                    );
                }
            };

            let component = renderIntoDocument(<Wrapper />);

            expect(component, 'to contain', (
                <span>Preserve this text as it was!</span>
            ));
        });

        it('should end truncating when a single word is bigger than its line', () => {
            let component = renderIntoDocument(
                <div>
                    <Truncate lines={2} ellipsis='…'>
                        Thereisasuperlongwordinthefirstline
                        so that the next lines won't be
                        visible
                    </Truncate>
                </div>
            );

            expect(component.children[0], 'to display text', `
                Thereisasuperl…
            `);
        });

        it('should be able to use a react component as ellipsis', () => {
            let component = renderIntoDocument(
                <div>
                    <Truncate lines={2} ellipsis={<a href='#'>… read more</a>}>
                        I'm curious what
                        the next lines of
                        text will say!
                    </Truncate>
                </div>
            );

            expect(component.children[0], 'to display text', `
                I'm curious what
                the … read more
            `);
        });
    });

    it('should recalculate when resizing the window', () => {
        let calcTargetWidth = sinon.spy(Truncate.prototype, 'calcTargetWidth');

        try {
            renderIntoDocument(<Truncate />);

            let numCalled = calcTargetWidth.callCount;

            window.dispatchEvent(new window.Event('resize'));

            expect(calcTargetWidth, 'was called times', numCalled + 1);
        } finally {
            Truncate.prototype.calcTargetWidth.restore();
        }
    });

    it('should clean up all event listeners on window when unmounting', () => {
        let events = new Set();

        sinon.stub(window, 'addEventListener', (name, handler) => {
            events.add({
                name,
                handler
            });
        });

        sinon.stub(window, 'removeEventListener', (name, handler) => {
            for (let event of events) {
                if (event.name === name && event.handler === handler) {
                    events.delete(event);
                }
            }
        });

        try {
            let container = document.createElement('div');

            render(<Truncate />, container);

            unmountComponentAtNode(container);

            expect(events.size, 'to be', 0);
        } finally {
            window.addEventListener.restore();
            window.removeEventListener.restore();
        }
    });
});
