// Create UserResource class For Response
class UserResource {
  constructor(user) {
    this._id = user?._id;
    this.identifier = user?.identifier;
    this.userType = user?.userType;
  }
  static Business(user) {
    return {
      _id: user?._id,
      identifier: user?.identifier,
      userType: user?.userType,
      userProfile: {
        _id: user.userProfile._id,
        firstName: user?.userProfile?.firstName,
        lastName: user?.userProfile?.lastName,
        avatarUrl: {
          url: process.env.BASE_URL + user?.userProfile?.avatarUrl?.file,
        },
        businessType: user?.userProfile?.businessType?.map((item) => {
          return {
            id: item?._id,
            name: item?.name,
          };
        }),

        businessSpecialty: user?.userProfile?.businessSpecialty?.map((item) => {
          return {
            id: item?._id,
            name: item?.name,
          };
        }),
        connection: user?.userProfile?.connection,
        jobOpenings: user?.userProfile?.jobOpenings,
        images: user?.userProfile?.images?.map((item) => {
          return {
            id: item?._id,
            url: process.env.BASE_URL + item?.file,
          };
        }),
        videos: user?.userProfile?.videos?.map((item) => {
          return {
            id: item?._id,
            url: process.env.BASE_URL + item?.file,
          };
        }),
        answeredQuestions: user?.userProfile?.answeredQuestions?.map((item) => {
          return {
            id: item?._id,
            question: item?.questionID?.question,
            answer: item?.answer,
          };
        }),
        profileCompleted: user?.userProfile?.profileCompleted,
        Subscription: {
          id: user?.userProfile?.Subscription?._id,
          name: user?.userProfile?.Subscription?.name,
          price: user?.userProfile?.Subscription?.price,
          duration: user?.userProfile?.Subscription?.duration,
          description: user?.userProfile?.Subscription?.description,
          features: user?.userProfile?.Subscription?.features,
        },
        isSubscribed: user?.userProfile?.isSubscribed,
        SubscriptionEndDate: user?.userProfile?.SubscriptionEndDate,
        rejectedUsers: user?.userProfile?.rejectedUsers,
        location: user?.userProfile?.location,
        inAppFeatures: user?.userProfile?.inAppFeatures,
        requestedUsers: user?.userProfile?.requestedUsers,
      },
      isVerified: user?.isVerified,
      notificationOn: user?.notificationOn,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    };
  }
  static Worker(user) {
    return {
      _id: user?._id,
      identifier: user?.identifier,
      userType: user?.userType,
      userProfile: {
        _id: user.userProfile._id,
        firstName: user?.userProfile?.firstName,
        lastName: user?.userProfile?.lastName,
        avatarUrl: {
          url: process.env.BASE_URL + user?.userProfile?.avatarUrl?.file,
        },
        jobPosition: user?.userProfile?.jobPosition?.map((item) => {
          return {
            id: item?._id,
            name: item?.name,
          };
        }),
        jobPositionSpecialty: user?.userProfile?.jobPositionSpecialty?.map((item) => {
          return {
            id: item?._id,
            name: item?.name,
          };
        }),
        connection: user?.userProfile?.connection,
        jobOpenings: user?.userProfile?.jobOpenings,
        images: user?.userProfile?.images?.map((item) => {
          return {
            id: item?._id,
            url: process.env.BASE_URL + item?.file,
          };
        }),
        videos: user?.userProfile?.videos?.map((item) => {
          return {
            id: item?._id,
            url: process.env.BASE_URL + item?.file,
          };
        }),
        answeredQuestions: user?.userProfile?.answeredQuestions?.map((item) => {
          return {
            id: item?._id,
            question: item?.questionID?.question,
            answer: item?.answer,
          };
        }),
        profileCompleted: user?.userProfile?.profileCompleted,
        Subscription: {
          id: user?.userProfile?.Subscription?._id,
          name: user?.userProfile?.Subscription?.name,
          price: user?.userProfile?.Subscription?.price,
          duration: user?.userProfile?.Subscription?.duration,
          description: user?.userProfile?.Subscription?.description,
          features: user?.userProfile?.Subscription?.features,
        },
        isSubscribed: user?.userProfile?.isSubscribed,
        SubscriptionEndDate: user?.userProfile?.SubscriptionEndDate,
        rejectedUsers: user?.userProfile?.rejectedUsers,
        location: user?.userProfile?.location,
        inAppFeatures: user?.userProfile?.inAppFeatures,
        requestedUsers: user?.userProfile?.requestedUsers,
        purchaseHistory: user?.userProfile?.purchaseHistory,
      },
      isVerified: user?.isVerified,
      notificationOn: user?.notificationOn,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    };
  }
}

export default UserResource;
