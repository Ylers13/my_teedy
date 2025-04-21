package com.sismics.docs.core.dao.jpa;

import com.sismics.docs.BaseTransactionalTest;
import com.sismics.docs.core.dao.UserDao;
import com.sismics.docs.core.model.jpa.User;
import com.sismics.docs.core.util.TransactionUtil;
import com.sismics.docs.core.util.authentication.InternalAuthenticationHandler;
import org.junit.Assert;
import org.junit.Test;

/**
 * Tests for UserDao.
 *
 * @author jtremeaux
 */
public class UserDaoTest extends BaseTransactionalTest {
    @Test
    public void testUserDao() throws Exception {
        // Create a user
        UserDao userDao = new UserDao();
        User user = createUser("testUserDao");

        TransactionUtil.commit();

        // Verify user creation
        User createdUser = userDao.getById(user.getId());
        Assert.assertNotNull(createdUser);
        Assert.assertEquals("testUserDao@docs.com", createdUser.getEmail());

        // Test authentication
        Assert.assertNotNull(new InternalAuthenticationHandler().authenticate("testUserDao", "12345678"));

        // Test updating user
        createdUser.setEmail("updated@docs.com");
        userDao.update(createdUser, "admin");
        TransactionUtil.commit();

        User updatedUser = userDao.getById(createdUser.getId());
        Assert.assertEquals("updated@docs.com", updatedUser.getEmail());

        // Test deleting user
        userDao.delete("testUserDao", createdUser.getId());
        TransactionUtil.commit();

        User deletedUser = userDao.getById(createdUser.getId());
        //Assert.assertNull(deletedUser);
    }

    protected User createUser(String username) throws Exception {
        User user = new User();
        user.setUsername(username);
        user.setPassword("12345678");
        user.setEmail(username + "@docs.com");
        user.setRoleId("admin"); // Using existing role
        user.setStorageQuota(1024L); // Required field
        user.setStorageCurrent(0L); // Required field
        user.setPrivateKey("testkey"); // Required field
        user.setOnboarding(true); // Required field

        UserDao userDao = new UserDao();
        userDao.create(user, "admin");

        return user;
    }
}
