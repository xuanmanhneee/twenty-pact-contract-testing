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

export const CREATE_ONE_PERSON_QUERY = `mutation CreateOnePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    __typename
    agentChatThreadTargets {
      edges {
        node {
          __typename
          id
          thread {
            __typename
            id
            title
          }
        }
        __typename
      }
      __typename
    }
    attachments {
      edges {
        node {
          __typename
          id
          name
        }
        __typename
      }
      __typename
    }
    avatarFile {
      fileId
      label
      extension
      url
      __typename
    }
    avatarUrl
    calendarEventParticipants {
      edges {
        node {
          __typename
          calendarEvent {
            __typename
            id
            title
          }
          handle
          id
        }
        __typename
      }
      __typename
    }
    calendarEventTargets {
      edges {
        node {
          __typename
          calendarEvent {
            __typename
            id
            title
          }
          id
        }
        __typename
      }
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
    listMemberships {
      edges {
        node {
          __typename
          id
          list {
            __typename
            id
            name
          }
        }
        __typename
      }
      __typename
    }
    messageParticipants {
      edges {
        node {
          __typename
          handle
          id
          message {
            __typename
            id
            subject
          }
        }
        __typename
      }
      __typename
    }
    messageThreadTargets {
      edges {
        node {
          __typename
          id
          messageThread {
            __typename
            id
            subject
          }
        }
        __typename
      }
      __typename
    }
    name {
      firstName
      lastName
      __typename
    }
    noteTargets {
      edges {
        node {
          __typename
          id
          note {
            __typename
            id
            title
          }
        }
        __typename
      }
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
    pointOfContactForOpportunities {
      edges {
        node {
          __typename
          id
          name
        }
        __typename
      }
      __typename
    }
    position
    taskTargets {
      edges {
        node {
          __typename
          id
          task {
            __typename
            id
            title
          }
        }
        __typename
      }
      __typename
    }
    timelineActivities {
      edges {
        node {
          __typename
          id
          linkedRecordCachedName
        }
        __typename
      }
      __typename
    }
    updatedAt
    updatedBy {
      source
      workspaceMemberId
      name
      context {
        provider
        __typename
      }
      __typename
    }
  }
}`;

export const CREATE_ONE_PERSON_VARIABLES = {
  input: {
    id: 'd05b3c0b-1da6-4a73-852b-6ad2b77f7d9e',
    position: 'first',
  },
};

// I-02: request FindManyCompanies thật của twenty-front (trang /objects/companies, v2.46.0).
export const FIND_MANY_COMPANIES_QUERY = `query FindManyCompanies($filter: CompanyFilterInput, $orderBy: [CompanyOrderByInput], $lastCursor: String, $limit: Int, $offset: Int) {
  companies(
    filter: $filter
    orderBy: $orderBy
    first: $limit
    after: $lastCursor
    offset: $offset
  ) {
    edges {
      node {
        __typename
        accountOwner {
          __typename
          avatarUrl
          id
          name {
            firstName
            lastName
            __typename
          }
        }
        accountOwnerId
        address {
          addressStreet1
          addressStreet2
          addressCity
          addressState
          addressCountry
          addressPostcode
          addressLat
          addressLng
          __typename
        }
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
        name
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

export const FIND_MANY_COMPANIES_VARIABLES = {
  filter: {},
  limit: 60,
  orderBy: [{ position: 'AscNullsFirst' }],
};

// I-04: request FindManyOpportunities thật của twenty-front (trang /objects/opportunities, v2.46.0).
export const FIND_MANY_OPPORTUNITIES_QUERY = `query FindManyOpportunities($filter: OpportunityFilterInput, $orderBy: [OpportunityOrderByInput], $lastCursor: String, $limit: Int, $offset: Int) {
  opportunities(
    filter: $filter
    orderBy: $orderBy
    first: $limit
    after: $lastCursor
    offset: $offset
  ) {
    edges {
      node {
        __typename
        amount {
          amountMicros
          currencyCode
          __typename
        }
        closeDate
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
        id
        name
        pointOfContact {
          __typename
          avatarFile {
            fileId
            label
            extension
            url
            __typename
          }
          id
          name {
            firstName
            lastName
            __typename
          }
        }
        pointOfContactId
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

export const FIND_MANY_OPPORTUNITIES_VARIABLES = {
  filter: {},
  limit: 60,
  orderBy: [{ position: 'AscNullsFirst' }],
};

// I-05: request GetCurrentUser thật của twenty-front khi mở app (v2.46.0).
// Lưu ý: operation này thuộc schema /metadata, không phải /graphql.
export const GET_CURRENT_USER_QUERY = `query GetCurrentUser {
  currentUser {
    ...UserQueryFragment
    __typename
  }
}

fragment WorkspaceMemberQueryFragment on WorkspaceMember {
  id
  name {
    firstName
    lastName
    __typename
  }
  colorScheme
  uiScale
  openRecordIn
  avatarUrl
  locale
  userEmail
  userId
  userWorkspaceId
  timeZone
  dateFormat
  timeFormat
  calendarStartDay
  numberFormat
  __typename
}

fragment PartialWorkspaceMemberQueryFragment on WorkspaceMember {
  id
  name {
    firstName
    lastName
    __typename
  }
  avatarUrl
  userEmail
  userId
  userWorkspaceId
  __typename
}

fragment DeletedWorkspaceMemberQueryFragment on DeletedWorkspaceMember {
  id
  name {
    firstName
    lastName
    __typename
  }
  avatarUrl
  userEmail
  __typename
}

fragment ObjectPermissionFragment on ObjectPermission {
  objectMetadataId
  canReadObjectRecords
  canUpdateObjectRecords
  canSoftDeleteObjectRecords
  canDestroyObjectRecords
  restrictedFields
  __typename
}

fragment RowLevelPermissionPredicateFragment on RowLevelPermissionPredicate {
  id
  fieldMetadataId
  objectMetadataId
  operand
  subFieldName
  workspaceMemberFieldMetadataId
  workspaceMemberSubFieldName
  rowLevelPermissionPredicateGroupId
  positionInRowLevelPermissionPredicateGroup
  roleId
  value
  __typename
}

fragment RowLevelPermissionPredicateGroupFragment on RowLevelPermissionPredicateGroup {
  id
  parentRowLevelPermissionPredicateGroupId
  logicalOperator
  positionInRowLevelPermissionPredicateGroup
  roleId
  objectMetadataId
  __typename
}

fragment WorkspaceUrlsFragment on WorkspaceUrls {
  subdomainUrl
  customUrl
  __typename
}

fragment BillingSubscriptionSchedulePhaseItemFragment on BillingSubscriptionSchedulePhaseItem {
  price
  quantity
  __typename
}

fragment BillingSubscriptionSchedulePhaseFragment on BillingSubscriptionSchedulePhase {
  start_date
  end_date
  items {
    ...BillingSubscriptionSchedulePhaseItemFragment
    __typename
  }
  __typename
}

fragment CurrentBillingSubscriptionFragment on BillingSubscription {
  id
  status
  interval
  metadata
  currentPeriodEnd
  cancelAt
  phases {
    ...BillingSubscriptionSchedulePhaseFragment
    __typename
  }
  billingSubscriptionItems {
    id
    hasReachedCurrentPeriodCap
    quantity
    stripePriceId
    unitAmount
    creditAmount
    billingProduct {
      name
      description
      images
      metadata {
        productKey
        planKey
        priceUsageBased
        isLegacy
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}

fragment BillingSubscriptionFragment on BillingSubscription {
  id
  status
  metadata
  cancelAt
  phases {
    ...BillingSubscriptionSchedulePhaseFragment
    __typename
  }
  __typename
}

fragment RoleFragment on Role {
  id
  label
  description
  icon
  canUpdateAllSettings
  canAccessAllTools
  isEditable
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  canBeAssignedToUsers
  canBeAssignedToAgents
  canBeAssignedToApiKeys
  __typename
}

fragment AvailableWorkspaceFragment on AvailableWorkspace {
  id
  displayName
  loginToken
  inviteHash
  personalInviteToken
  workspaceUrls {
    subdomainUrl
    customUrl
    __typename
  }
  logo
  sso {
    type
    id
    issuer
    name
    status
    __typename
  }
  __typename
}

fragment AvailableWorkspacesFragment on AvailableWorkspaces {
  availableWorkspacesForSignIn {
    ...AvailableWorkspaceFragment
    __typename
  }
  availableWorkspacesForSignUp {
    ...AvailableWorkspaceFragment
    __typename
  }
  __typename
}

fragment UserQueryFragment on User {
  id
  firstName
  lastName
  email
  hasPassword
  canAccessFullAdminPanel
  canImpersonate
  supportUserHash
  onboardingStatus
  previousOnboardingStatus
  isWorkspaceCreator
  workspaceMember {
    ...WorkspaceMemberQueryFragment
    __typename
  }
  workspaceMembers {
    ...PartialWorkspaceMemberQueryFragment
    __typename
  }
  deletedWorkspaceMembers {
    ...DeletedWorkspaceMemberQueryFragment
    __typename
  }
  currentUserWorkspace {
    id
    permissionFlags
    isImpersonating
    objectsPermissions {
      ...ObjectPermissionFragment
      rowLevelPermissionPredicates {
        ...RowLevelPermissionPredicateFragment
        __typename
      }
      rowLevelPermissionPredicateGroups {
        ...RowLevelPermissionPredicateGroupFragment
        __typename
      }
      __typename
    }
    twoFactorAuthenticationMethodSummary {
      twoFactorAuthenticationMethodId
      status
      strategy
      __typename
    }
    __typename
  }
  currentWorkspace {
    id
    displayName
    logo
    inviteHash
    allowImpersonation
    activationStatus
    isPublicInviteLinkEnabled
    isCampaignClickTrackingEnabled
    workspaceDiscoverability
    isGoogleAuthEnabled
    isMicrosoftAuthEnabled
    isPasswordAuthEnabled
    isGoogleAuthBypassEnabled
    isMicrosoftAuthBypassEnabled
    isPasswordAuthBypassEnabled
    subdomain
    customDomain
    hasValidSignedEnterpriseKey
    hasValidEnterpriseValidityToken
    workspaceCustomApplication {
      id
      __typename
    }
    installedApplications {
      id
      name
      universalIdentifier
      logoUrl
      __typename
    }
    isCustomDomainEnabled
    workspaceUrls {
      ...WorkspaceUrlsFragment
      __typename
    }
    featureFlags {
      key
      value
      __typename
    }
    currentBillingSubscription {
      ...CurrentBillingSubscriptionFragment
      __typename
    }
    billingCustomer {
      id
      hasPaymentMethod
      __typename
    }
    billingSubscriptions {
      ...BillingSubscriptionFragment
      __typename
    }
    billingEntitlements {
      key
      value
      __typename
    }
    workspaceMembersCount
    defaultRole {
      ...RoleFragment
      __typename
    }
    aiChatModelTier
    aiAgentModelTier
    isAutoModelSelectionEnabled
    aiModelIdByTier
    aiAdditionalInstructions
    isTwoFactorAuthenticationEnforced
    trashRetentionDays
    eventLogRetentionDays
    editableProfileFields
    isInternalMessagesImportEnabled
    __typename
  }
  availableWorkspaces {
    ...AvailableWorkspacesFragment
    __typename
  }
  userVars
  __typename
}`;

export const GET_CURRENT_USER_VARIABLES = {};
