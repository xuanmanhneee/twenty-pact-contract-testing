// Query + variables chép nguyên từ DevTools (trang People, bản v2.46.0).
export const FIND_MANY_PEOPLE_QUERY = `query FindManyPeople($filter: PersonFilterInput, $orderBy: [PersonOrderByInput], $lastCursor: String, $limit: Int, $offset: Int) {
  people(
    filter: $filter
    orderBy: $orderBy
    first: $limit
    after: $lastCursor
    offset: $offset
  ) {
    edges {
      node {
        __typename
        avatarFile {
          fileId
          label
          extension
          url
          __typename
        }
        company {
          __typename
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks {
              label
              url
              __typename
            }
            __typename
          }
          id
          name
        }
        companyId
        createdAt
        createdBy {
          source
          workspaceMemberId
          name
          context {
            provider
            __typename
          }
          __typename
        }
        deletedAt
        emails {
          primaryEmail
          additionalEmails
          __typename
        }
        id
        jobTitle
        linkedinLink {
          primaryLinkUrl
          primaryLinkLabel
          secondaryLinks {
            label
            url
            __typename
          }
          __typename
        }
        name {
          firstName
          lastName
          __typename
        }
        phones {
          primaryPhoneNumber
          primaryPhoneCountryCode
          primaryPhoneCallingCode
          additionalPhones {
            number
            callingCode
            countryCode
            __typename
          }
          __typename
        }
        position
        updatedAt
      }
      cursor
      __typename
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
      __typename
    }
    totalCount
    __typename
  }
}`;

export const FIND_MANY_PEOPLE_VARIABLES = {
  filter: {},
  limit: 60,
  orderBy: [{ position: 'AscNullsFirst' }],
};