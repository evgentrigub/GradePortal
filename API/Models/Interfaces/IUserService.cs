﻿using System.Collections.Generic;

namespace GradePortalAPI.Models.Interfaces
{
    public interface IUserService
    {
        User Authenticate(string username, string password);
        IEnumerable<User> GetAll();
        User GetById(string id);
        User GetByUserName(string username);
        User Create(User user, string password);
        void Update(string id, User user, string password = null);
        void Delete(int id);
    }
}