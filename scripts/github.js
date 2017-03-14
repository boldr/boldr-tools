const dotenv = require('dotenv');
const fetch = require('node-fetch');
const packageJson = require('../package.json');

dotenv.config();

const apiEndpoint = 'https://api.github.com';
const apiToken = process.env.GITHUB_API_TOKEN;

function request(method, url, content, pagedData) {
  let body;

  if (content) {
    body = JSON.stringify(content);
  }

  if (!url.startsWith(apiEndpoint)) {
    url = apiEndpoint + url;
  }

  const headers = {
    'User-Agent': `${packageJson.name}/${packageJson.version}`,
    Accept: 'application/vnd.github.v3+json',
  };

  if (apiToken) {
    headers.Authorization = `token ${apiToken}`;
  }

  if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
    headers['Content-Type'] = 'application/json';
  }

  if (method === 'PUT' && !body) {
    headers['Content-Length'] = 0;
  }

  return fetch(url, { method,
    body,
    headers }).then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with response status ${response.status} (${response.statusText}): ${url}`);
      }

      if (pagedData) {
        return response.json().then((data) => {
          if (data instanceof Array) {
            pagedData.push(...data);
          } else if (data.items instanceof Array) {
            pagedData.push(...data.items);
          } else {
            throw new Error('Unexpected response data');
          }

          const linkHeader = response.headers.get('link');
          const links = (linkHeader) ? linkHeader.split(', ') : [];
          const nextUrl = links.reduce((nextLink, link) => {
            const linkMatch = link.match(/^<(.*)>; rel="(.*)"$/);
            if (linkMatch && linkMatch[2] === 'next') {
              return linkMatch[1];
            } else {
              return nextLink;
            }
          }, null);

          if (nextUrl) {
            return request(method, nextUrl, content, pagedData);
          } else {
            return pagedData;
          }
        });
      }

      return response.json();
    });
}

function get(url, paged) {
  if (paged) {
    return request('GET', url, null, []);
  } else {
    return request('GET', url, null);
  }
}

function post(url, content) {
  return request('POST', url, content);
}

exports.get = get;
exports.post = post;
