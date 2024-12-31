/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author HP
 */
//import java.awt.*;
//import java.text.MessageFormat;
import java.io.*;
//import java.util.stream; 
//import static java.lang.Math.random;
//import java.security.InvalidKeyException;
import java.security.Key;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Security;
//import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
//import javax.crypto.IllegalBlockSizeException;
//import java.security.NoSuchAlgorithmException;
//import java.security.NoSuchProviderException;
//import java.security.Provider;
//import javax.crypto.NoSuchPaddingException;
//import net.proteanit.sql.DbUtils;
//import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.bouncycastle.util.encoders.Hex;
//import java.security.NoSuchAlgorithmException;

public class HybridEncryptionEvaluationALL {
  public static void main(String args []) throws Exception
    {
    // INSERT BUTTON OPERATION:
    // Evaluation of the hybrid encryption algorithm developed by Gana PhD for data remanence deletion/thrashing.
    // Enter the plaintext = matric number of students or client's data element.    
            //String MATRICNO = "20L1CY0010";
            String MATRICNO = "7/30/2012 107.95";
                long st1 = System.nanoTime();
                // ElGamal Homomorphic Encryption
                Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
                byte[] input = MATRICNO.getBytes();
                 Cipher cipher = Cipher.getInstance("ElGamal/None/NoPadding", "BC");
                 KeyPairGenerator generator = KeyPairGenerator.getInstance("ElGamal", "BC");
                 SecureRandom random = new SecureRandom();
                 generator.initialize(1028, random);//128 original too small but changed to 1028...
                 KeyPair pair = generator.generateKeyPair();
                 Key pubKey = pair.getPublic();
                 Key privKey = pair.getPrivate();
                 cipher.init(Cipher.ENCRYPT_MODE, pubKey, random);
                 byte [] cipherText = cipher.doFinal(input);
                 //long et1=System.nanoTime();                   
                String matricno = new String(cipherText);
                long et1 = System.nanoTime();
            
            // encryption by AES encryption
            long st2 = System.nanoTime();
            // try encryption and decryption
            // first trial position here....
            //String TextEncrypt = "12345"; // use cipherText from ElGamal HE operation above.
            aes myaes = new aes();
            //String myexnt =  myaes.encrypt(TextEncrypt);
            String matricno_2 =  myaes.encrypt(matricno);
            //long st21=System.currentTimeMillis();
            //AES-256 on Plaintext/MATRICNO
            // String matricno_21 =  myaes.encrypt(MATRICNO);
            long et2=System.nanoTime();
            
            //execution time
            //System.out.println("Encryption time in ms = " + (et2-st21));
            //System.out.println("Encryption time in ms = " + (st21-st2));
            
            
            // SHA-256 encryption operation
            long st3=System.nanoTime();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            //byte[] hash = digest.digest(MATRICNO.getBytes(StandardCharsets.UTF_8));
            //String matricno_3 = new String(Hex.encode(hash));  
            //SHA-256 on Plaintext/MATRICNO
            //long st3 = System.nanoTime();
            byte[] hash1 = digest.digest(matricno_2.getBytes(StandardCharsets.UTF_8));
            String matricno_31 = new String(Hex.encode(hash1)); 
            long et3 = System.nanoTime();
            System.out.println();
            System.out.println();
            
            //execution time
            //System.out.println("Encryption time in ms = " + (st31-st3));
            //System.out.println("Encryption time in ms = " + (et3-st31));
               
           System.out.println("=========Developed Data Remanance Deletion/Thrashing Encryption Algorithm=========");
           System.out.println("Client's Data Element = " + MATRICNO);
           System.out.println();
           // number of characters
           //final String plaintext = MATRICNO;
           //int count1 = plaintext.length();
           System.out.println("Plaintext size (char*2) in bytes = " + ((MATRICNO.getBytes().length)*2));
           System.out.println();
           System.out.println();
           
           
           //System.out.println("ElGamal Encryption Output = " + matricno);
           System.out.println("ElGamal Encryption Output = ");
           System.out.println(matricno);
           //System.out.println("ElGamal Encryption Output = " + matricno); // only ElGamal HE
           System.out.println();
           //execution time
           System.out.println("Encryption time in ns = " + (et1-st1));
           // number of characters
           System.out.println("ElGamal Ciphertext size (char*2) in bytes = " + ((matricno.getBytes().length)*2));
           
           System.out.println("ElGamal + AES-256 Encryptions Output = " + matricno_2); // after ElGamal HE + AES-256
           //execution time
           System.out.println("Encryption time in ns = " + (et2-st2));
           // number of characters
           System.out.println("ElGamal+AES-256 Ciphertext size (char*2) in bytes = " + ((matricno_2.getBytes().length)*2));
           System.out.println();
           
           
           System.out.println("ElGamal + AES-256 + SHA-256 Encryptions Output = " + matricno_31); //after ElGamal HE + AES-256 + SHA-256
           //execution time
           System.out.println("Encryption time in ns = " + (et3-st3));
           // number of characters
           System.out.println("ElGamal+AES-256+SHA-256 Ciphertext size (char*2) in bytes = " + ((matricno_31.getBytes().length)*2));
           System.out.println();
           
           //System.out.println("SHA-256 Encryption Output = " + matricno_3);
           System.out.println("=========End of Evaluation=========");
           System.out.println();
           System.out.println();
           System.out.println("=========Start Files (Image/Audio/Video) Encryption Evaluation=========");
           
           long st4=System.nanoTime();
           // Audio/video/image convert to bytes
            //File file2 = new File("C:\\Users\\HP\\Downloads\\Davido-The-Best.mp3");
            File file2 = new File("C:\\Users\\HP\\Downloads\\Eko.jpeg");
            //File file2 = new File("C:\\Users\\HP\\Downloads\\GMT20200715-182956_CS106B-Lec_1920x1080.mp4");
            byte[] byteArray2 = new byte[(int) file2.length()];
            FileInputStream fis = new FileInputStream(file2);
            fis.read(byteArray2);
            fis.close();
            //return byteArray2;
            //byte [] cipherText2 = cipher.doFinal(byteArray2);
                 //long et1=System.nanoTime();                   
            String audiobytes_0 = new String(byteArray2, StandardCharsets.UTF_8);
            byte[] hash2 = digest.digest(audiobytes_0.getBytes(StandardCharsets.UTF_8));
            long et4=System.nanoTime();
            
            String audiobytes = new String(Hex.encode(hash2)); 
            System.out.println("Bytes of file" + byteArray2);
            System.out.println("Encrypted file bytes" + audiobytes);
            //System.out.println("Ciphertext size (char*2) in bytes = " + ((audiobytes.length()));
            System.out.println("file ciphertext size (char*2) in bytes = " + ((audiobytes.getBytes().length)*2));
            System.out.println("Encryption time in ns = " + (et4-st4));
       }   
}
