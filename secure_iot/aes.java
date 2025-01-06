/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
//package javamysqlconnect;
//package javamysqlconnect use this one plss;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
//import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import org.bouncycastle.util.encoders.Hex;
//import static javax.swing.UIManager.getString;
 
public class aes {
 
    private static SecretKeySpec secretKey;
    private static byte[] key;
    //private  final String secret= "minor2";
    // ciphertext=== 642c4b9b29f85b832740932a1878cc045c020c4062a50faaeedbb58886734667
    //private  final String secret= "B@63961c42, 27, 106, 122, -61, -95, -84, 58, -75, 3, -38, 51, 101, -124, 113, -32, -16, 110, -85, 46, -80, 40, -61, 18, -87, 23, -115, -41, -37, -102, 71, -100";
    // ciphertext with rlwe == 41e11a5ef7b2ca183863476fbe71fcc866ca50d7ae94063834b5dd330195c778
    //SecureRandom random = new SecureRandom();
    //private final String secret = getString(random);
    //Umar Abdulkadir RLWE asymmetric keys = symmetric secret key generation for AES+SHA encryption procedure
    //body sensor data.
    private  final String secret= "B@3dd4a6fa,-1, -64, 62, -48, -33, -44, -39, -83, 87, 30, 102, 42, 36, 79, -39, 103, 43, 47, -14, 32, 41, -126, 42, -18,-15, 105, 98, -42, -27, 34, 98, -25";

    
    public void setKey(String myKey) 
    {
        MessageDigest sha = null;
        try {
            key = myKey.getBytes("UTF-8");
            sha = MessageDigest.getInstance("SHA-1");
            key = sha.digest(key);
            key = Arrays.copyOf(key, 16); 
            secretKey = new SecretKeySpec(key, "AES");
        } 
        catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } 
        catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }
 
    public String encrypt(String strToEncrypt) 
    {
        try
        {
            setKey(secret);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(strToEncrypt.getBytes("UTF-8")));
        } 
        catch (Exception e) 
        {
            System.out.println("Error while encrypting: " + e.toString());
        }
        return null;
    }
 
    public  String decrypt(String strToDecrypt) 
    {
        try
        {
            setKey(secret);
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5PADDING");
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return new String(cipher.doFinal(Base64.getDecoder().decode(strToDecrypt)));
        } 
        catch (Exception e) 
        {
            System.out.println("Error while decrypting: " + e.toString());
        }
        return null;
        //JavaMYSQLConnect.main();
    }
    public static void main(String args[]) throws NoSuchAlgorithmException{
            aes myaes = new aes();
            //String myexnt =  myaes.encrypt(TextEncrypt);
            //String matricno = "hsh3443n";
            //Umar Abdulkadir body sensor dataset encryption
            String sensor_data = "34.94,1392,17:46:08";
            String sensor_enc =  myaes.encrypt(sensor_data);
            System.out.println("Original String  " + sensor_data);
            System.out.println("AES256 Encryption String  " + sensor_enc);
            //AES decryption
            String sensor_dec =  myaes.decrypt(sensor_enc);
            System.out.println("AES256 Decryption String  " + sensor_dec);
            // SHA-256 encryption operation
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(sensor_enc.getBytes(StandardCharsets.UTF_8));
            String sensor_enc2 = new String(Hex.encode(hash)); 
            System.out.println("AES256+SHA256 Encryption String  " + sensor_enc2);
            //SHA decryption
            
}
}
