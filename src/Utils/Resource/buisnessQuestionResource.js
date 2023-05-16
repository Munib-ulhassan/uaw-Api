// Create UserResource class For Response
class buisnessQuestionResource {
  constructor(Questions) {
    this._id = Questions._id;
    this.title = Questions.title;
    this.specialties = Questions.specialties.map((item) => {
      return {
        _id: item._id,
        name: item.name,
      };
    });
    this.questions = Questions.questions.map((item) => {
      return {
        _id: item._id,
        question: item.question,
        questionType: item.questionType,
        questionRef: item.questionRef,
      };
    });
  }
  static collection(Questions) {
    return Questions.map((item) => new buisnessQuestionResource(item));
  }
  static OnlyBusinessType(Questions) {
    return Questions.map((item) => {
      return {
        _id: item._id,
        title: item.title,
        specialties: item.specialties,
      };
    });
  }
}

export default buisnessQuestionResource;
