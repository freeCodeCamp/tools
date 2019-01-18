const state = 'open';
const base = 'master';
const sort = 'created';
const page = 1;
// eslint-disable-next-line camelcase
const per_page = 1;

const getCount = async(context) => {
  const config = { ...context.repo() };
  const { owner, repo } = config;
  const {
    data: { total_count: count }
  } = await context.github.search
    .issues({
      q: `repo:${owner}/${repo}+is:open+type:pr+base:master`,
      sort: 'created',
      order: 'asc',
      page: 1,
      // eslint-disable-next-line camelcase
      per_page: 1
    })
    .catch(err => {
      console.log(err);
    });
  return count;
};

const getFirst = async(context) => {
  const config = { ...context.repo() };
  const { owner, repo } = config;
  let methodProps = {
    owner,
    repo,
    state,
    base,
    sort,
    direction: 'asc',
    page,
    // eslint-disable-next-line camelcase
    per_page
  };
  let response = await context.github.pullRequests.list(methodProps);
  return response.data[0].number;
};

const getRange = async(context) => {
  const config = { ...context.repo() };
  const { owner, repo } = config;
  let methodProps = {
    owner,
    repo,
    state,
    base,
    sort,
    direction: 'asc',
    page,
    // eslint-disable-next-line camelcase
    per_page
  };
  let response = await context.github.pullRequests.list(methodProps);
  const firstPR = response.data[0].number;
  methodProps = {
    owner,
    repo,
    state,
    base,
    sort,
    direction: 'desc',
    page,
    // eslint-disable-next-line camelcase
    per_page
  };
  response = await context.github.pullRequests.list(methodProps);
  const lastPR = response.data[0].number;
  return [firstPR, lastPR];
};

module.exports = { getCount, getFirst, getRange };
