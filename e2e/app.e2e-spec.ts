import { PrototypeCommunesPage } from './app.po';

describe('prototype-communes App', () => {
  let page: PrototypeCommunesPage;

  beforeEach(() => {
    page = new PrototypeCommunesPage();
  });

  it('should display welcome message', done => {
    page.navigateTo();
    page.getParagraphText()
      .then(msg => expect(msg).toEqual('Welcome to app!!'))
      .then(done, done.fail);
  });
});
